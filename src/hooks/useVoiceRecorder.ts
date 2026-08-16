import { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceRecorderResult {
  transcript: string;
  audioUrl: string | null;
  audioBlob: Blob | null;
  duration: number;
}

export interface UseVoiceRecorderOptions {
  onTranscriptChange?: (text: string) => void;
  onFinalResult?: (result: VoiceRecorderResult) => void;
  language?: string;
}

// Window declaration for speech recognition
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
  AudioContext?: any;
  webkitAudioContext?: any;
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}) {
  const { onTranscriptChange, onFinalResult, language = 'en-US' } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0); // 0 to 1
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);

  const isSpeechRecognitionSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in (window as IWindow));

  const isMediaRecorderSupported = typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';

  // Volume measurement loop
  const updateVolume = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    const normalized = Math.min(1, Math.max(0, avg / 128));
    setVolumeLevel(normalized);

    animationFrameRef.current = requestAnimationFrame(updateVolume);
  }, []);

  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setVolumeLevel(0);
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setAudioUrl(null);
    setDuration(0);
    audioChunksRef.current = [];

    let currentTranscript = '';

    // 1. Initialize Speech-to-Text if supported
    if (isSpeechRecognitionSupported) {
      try {
        const SpeechRecognitionClass =
          (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition;
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              final += item[0].transcript + ' ';
            } else {
              interim += item[0].transcript;
            }
          }

          if (final) {
            currentTranscript = (currentTranscript + ' ' + final).trim();
            setTranscript(currentTranscript);
            onTranscriptChange?.(currentTranscript);
          }
          setInterimTranscript(interim);
        };

        recognition.onerror = (e: any) => {
          if (e.error !== 'no-speech') {
            console.warn('Speech recognition warning:', e.error);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err: any) {
        console.warn('Could not start speech recognition:', err);
      }
    }

    // 2. Initialize Microphone Stream & Audio Recorder
    if (isMediaRecorderSupported) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Audio analyser for real-time visualization
        const AudioCtx = (window as IWindow).AudioContext || (window as IWindow).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;
          updateVolume();
        }

        // Media recorder
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose default
          }
        }

        const mediaRecorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(200);
        mediaRecorderRef.current = mediaRecorder;
      } catch (err: any) {
        console.error('Microphone access denied:', err);
        setError('Microphone access was denied or not found.');
        cleanupAudio();
        return;
      }
    }

    setIsRecording(true);

    // Duration timer
    timerIntervalRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
  }, [isSpeechRecognitionSupported, isMediaRecorderSupported, language, onTranscriptChange, updateVolume, cleanupAudio]);

  const stopRecording = useCallback((): Promise<VoiceRecorderResult> => {
    return new Promise((resolve) => {
      if (!isRecording && !mediaRecorderRef.current && !recognitionRef.current) {
        resolve({ transcript: '', audioUrl: null, audioBlob: null, duration: 0 });
        return;
      }

      setIsRecording(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }

      const currentDuration = duration;
      const finalTranscriptText = (transcript + ' ' + interimTranscript).trim();
      setInterimTranscript('');

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current?.mimeType || 'audio/webm'
          });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);

          cleanupAudio();

          const result: VoiceRecorderResult = {
            transcript: finalTranscriptText,
            audioUrl: url,
            audioBlob: blob,
            duration: currentDuration
          };

          onFinalResult?.(result);
          resolve(result);
        };

        mediaRecorderRef.current.stop();
      } else {
        cleanupAudio();
        const result: VoiceRecorderResult = {
          transcript: finalTranscriptText,
          audioUrl: null,
          audioBlob: null,
          duration: currentDuration
        };
        onFinalResult?.(result);
        resolve(result);
      }
    });
  }, [isRecording, duration, transcript, interimTranscript, cleanupAudio, onFinalResult]);

  const cancelRecording = useCallback(() => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    cleanupAudio();
    setTranscript('');
    setInterimTranscript('');
    setAudioUrl(null);
    setDuration(0);
  }, [cleanupAudio]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    isRecording,
    transcript,
    interimTranscript,
    fullTranscript: (transcript + ' ' + interimTranscript).trim(),
    duration,
    volumeLevel,
    audioUrl,
    error,
    isSpeechRecognitionSupported,
    isMediaRecorderSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    setTranscript,
  };
}
