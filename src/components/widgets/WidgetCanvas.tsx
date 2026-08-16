import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetItem, Task, CategoryStyle } from '../../types';
import { useWidgetStore } from '../../store/useWidgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useUIStore } from '../../store/useUIStore';
import { WidgetCard } from './WidgetCard';
import { AdaptiveSlider } from '../watermelon/AdaptiveSlider';
import { ShuffledPinnedList } from '../watermelon/ShuffledPinnedList';
import { CardSwipeDeck } from '../watermelon/CardSwipeDeck';
import { CareerBlocks } from '../watermelon/CareerBlocks';
import { CaptureInput } from '../layout/CaptureInput';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { VoiceVisualizer, AudioMemoPlayer } from '../common/VoiceVisualizer';
import { StarIcon, ZapIcon, CheckIcon, SparklesIcon, XIcon, PlusIcon } from '../icons/Icons';
import * as Tone from 'tone';

export interface WidgetCanvasProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onArchiveTask: (id: string) => void;
  onTogglePin: (id: string) => void;
  onFocusTask: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onPlantSeed: () => void;
  allCategories: Record<string, CategoryStyle>;
  allTags: string[];
}

const VoiceMemoWidget: React.FC<{ onAddTask: (text: string) => void; tasks: Task[] }> = ({ onAddTask }) => {
  const [recordedNotes, setRecordedNotes] = useState<{ id: string; title: string; url: string; duration: number }[]>([]);
  const {
    isRecording,
    interimTranscript,
    duration,
    volumeLevel,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder({
    onFinalResult: (result) => {
      if (result.transcript.trim()) {
        onAddTask(result.transcript.trim());
      }
      if (result.audioUrl) {
        setRecordedNotes(prev => [
          {
            id: 'vm-' + Date.now(),
            title: result.transcript.trim() || `Voice Note (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
            url: result.audioUrl!,
            duration: result.duration,
          },
          ...prev.slice(0, 4),
        ]);
      }
    },
  });

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">Hands-free voice capture</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
          NLP Speech-to-Text
        </span>
      </div>

      <AnimatePresence>
        {isRecording && (
          <VoiceVisualizer
            isRecording={isRecording}
            volumeLevel={volumeLevel}
            duration={duration}
            interimTranscript={interimTranscript}
            onStop={() => stopRecording()}
            onCancel={cancelRecording}
          />
        )}
      </AnimatePresence>

      {!isRecording && (
        <button
          type="button"
          onClick={() => startRecording()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500/20 via-indigo-500/20 to-teal-500/20 border border-teal-400/30 hover:border-teal-400/60 text-white font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-teal-500/10 group"
        >
          <span className="text-xl group-hover:scale-125 transition-transform">🎙️</span>
          <span>Tap to Record Voice Task</span>
        </button>
      )}

      {recordedNotes.length > 0 && (
        <div className="space-y-2 mt-1">
          <p className="text-[11px] font-semibold text-white/70">Recent Voice Notes</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {recordedNotes.map(n => (
              <AudioMemoPlayer
                key={n.id}
                src={n.url}
                duration={n.duration}
                title={n.title}
                onDelete={() => setRecordedNotes(prev => prev.filter(x => x.id !== n.id))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const WidgetCanvas: React.FC<WidgetCanvasProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onArchiveTask,
  onTogglePin,
  onFocusTask,
  onOpenDetail,
  onPlantSeed,
  allCategories,
  allTags,
}) => {
  const widgets = useWidgetStore(s => s.widgets);
  const isEditMode = useWidgetStore(s => s.isEditMode);
  const setIsEditMode = useWidgetStore(s => s.setIsEditMode);
  const setIsAddWidgetDrawerOpen = useWidgetStore(s => s.setIsAddWidgetDrawerOpen);
  const removeWidget = useWidgetStore(s => s.removeWidget);
  const resizeWidget = useWidgetStore(s => s.resizeWidget);
  const resetToDefaultLayout = useWidgetStore(s => s.resetToDefaultLayout);
  const scratchpadNotes = useWidgetStore(s => s.scratchpadNotes);
  const setScratchpadNotes = useWidgetStore(s => s.setScratchpadNotes);
  const careerProfile = useWidgetStore(s => s.careerProfile);
  const toggleCareerGoal = useWidgetStore(s => s.toggleCareerGoal);
  const addCareerGoal = useWidgetStore(s => s.addCareerGoal);

  const stats = useSettingsStore(s => s.stats);
  const grove = useSettingsStore(s => s.grove);
  const soundEffectsEnabled = useSettingsStore(s => s.soundEffectsEnabled);
  const setIsMindfulMinuteOpen = useUIStore(s => s.setIsMindfulMinuteOpen);

  // Focus Timer Widget State
  const [focusDuration, setFocusDuration] = useState(25);
  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isFocusRunning && focusTimeLeft > 0) {
      interval = setInterval(() => setFocusTimeLeft(t => t - 1), 1000);
    } else if (focusTimeLeft === 0 && isFocusRunning) {
      setIsFocusRunning(false);
      useSettingsStore.getState().playSoundEffect('win');
      useSettingsStore.getState().setStats(s => ({ ...s, totalFocusMinutes: s.totalFocusMinutes + focusDuration }));
    }
    return () => clearInterval(interval);
  }, [isFocusRunning, focusTimeLeft, focusDuration]);

  // Ambient Noise Widget State
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const [noiseType, setNoiseType] = useState<'brown' | 'pink' | 'white'>('brown');
  const [noiseVolume, setNoiseVolume] = useState(70);
  const noiseNodeRef = React.useRef<Tone.Noise | null>(null);
  const gainNodeRef = React.useRef<Tone.Gain | null>(null);

  const toggleAmbientNoise = async () => {
    await Tone.start();
    if (isPlayingNoise) {
      noiseNodeRef.current?.stop();
      noiseNodeRef.current?.dispose();
      noiseNodeRef.current = null;
      gainNodeRef.current?.dispose();
      gainNodeRef.current = null;
      setIsPlayingNoise(false);
    } else {
      const gain = new Tone.Gain(noiseVolume / 100).toDestination();
      const noise = new Tone.Noise(noiseType).connect(gain);
      noise.start();
      noiseNodeRef.current = noise;
      gainNodeRef.current = gain;
      setIsPlayingNoise(true);
    }
  };

  const handleNoiseVolumeChange = (v: number) => {
    setNoiseVolume(v);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.rampTo(v / 100, 0.1);
    }
  };

  const visibleWidgets = widgets.filter(w => w.visible !== false);

  const renderWidgetContent = (widget: WidgetItem) => {
    switch (widget.type) {
      case 'capture':
        return (
          <div className="flex flex-col justify-center h-full">
            <CaptureInput
              onAddTask={onAddTask}
              allCategories={allCategories}
              allTags={allTags}
            />
          </div>
        );

      case 'shuffled_pinned':
        return (
          <ShuffledPinnedList
            tasks={tasks}
            onToggleTask={onToggleTask}
            onTogglePin={onTogglePin}
            onFocusTask={onFocusTask}
            onOpenDetail={onOpenDetail}
            allCategories={allCategories}
          />
        );

      case 'triage_deck':
        return (
          <CardSwipeDeck
            tasks={tasks}
            onComplete={onToggleTask}
            onArchive={onArchiveTask}
            onFocus={onFocusTask}
            onTogglePin={onTogglePin}
            allCategories={allCategories}
          />
        );

      case 'focus_timer': {
        const mins = Math.floor(focusTimeLeft / 60);
        const secs = focusTimeLeft % 60;
        const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        const timerProgress = 1 - (focusTimeLeft / (focusDuration * 60));

        return (
          <div className="flex flex-col justify-between h-full gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">⏱️ Deep Focus Timer</span>
              <span className="text-[10px] font-mono text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full font-bold">
                {isFocusRunning ? 'Session Active' : 'Ready'}
              </span>
            </div>

            {/* Countdown Display */}
            <div className="flex items-center justify-center my-auto py-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/10" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <motion.path
                    className="text-[var(--color-accent)]"
                    strokeDasharray={`${timerProgress * 100}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono text-2xl font-black text-white">
                  {formattedTime}
                </span>
              </div>
            </div>

            {/* Adaptive Slider */}
            {!isFocusRunning && (
              <AdaptiveSlider
                value={focusDuration}
                min={15}
                max={90}
                steps={[15, 25, 45, 60, 90]}
                formatLabel={v => `${v} min`}
                onChange={v => {
                  setFocusDuration(v);
                  setFocusTimeLeft(v * 60);
                }}
              />
            )}

            {/* Controls */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsFocusRunning(!isFocusRunning)}
                className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all shadow-lg ${
                  isFocusRunning
                    ? 'bg-amber-400 text-black hover:bg-amber-300'
                    : 'bg-[var(--color-accent)] text-black hover:opacity-90'
                }`}
              >
                {isFocusRunning ? '⏸️ Pause Session' : '▶️ Start Focus'}
              </button>
              <button
                onClick={() => {
                  setIsFocusRunning(false);
                  setFocusTimeLeft(focusDuration * 60);
                }}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        );
      }

      case 'career_blocks':
        return (
          <CareerBlocks
            careerProfile={careerProfile}
            onToggleGoal={toggleCareerGoal}
            onAddGoal={addCareerGoal}
          />
        );

      case 'momentum': {
        const todayStr = new Date().toISOString().split('T')[0];
        const completedToday = tasks.filter(t => t.completionDate === todayStr).length;
        const totalPlannedMinutes = tasks.filter(t => !t.completed && !t.isArchived).reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
        const plannedHours = (totalPlannedMinutes / 60).toFixed(1);
        const capacityPct = Math.min(100, Math.round((totalPlannedMinutes / 480) * 100));

        return (
          <div className="flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">📊 Daily Velocity & Capacity</span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                🔥 {stats.streak}d Streak
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-auto">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 block">Tasks Completed</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{completedToday}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 block">Workday Planned</span>
                <span className="text-xl font-bold font-mono text-teal-300">{plannedHours}h</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-white/60 mb-1">
                <span>8h Capacity Utilization</span>
                <span>{capacityPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${capacityPct > 100 ? 'bg-rose-500' : 'bg-teal-400'}`}
                  style={{ width: `${Math.min(100, capacityPct)}%` }}
                />
              </div>
            </div>
          </div>
        );
      }

      case 'ambient':
        return (
          <div className="flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">🎧 Focus Soundscape</span>
              <span className={`w-2.5 h-2.5 rounded-full ${isPlayingNoise ? 'bg-teal-400 animate-pulse' : 'bg-white/20'}`} />
            </div>

            <div className="flex gap-1.5 justify-center py-1">
              {(['brown', 'pink', 'white'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setNoiseType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    noiseType === type ? 'bg-teal-400 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <AdaptiveSlider
              value={noiseVolume}
              min={0}
              max={100}
              formatLabel={v => `${v}%`}
              onChange={handleNoiseVolumeChange}
            />

            <button
              onClick={toggleAmbientNoise}
              className={`w-full py-1.5 rounded-xl text-xs font-bold transition-colors ${
                isPlayingNoise ? 'bg-rose-500 text-white' : 'bg-teal-400 text-black hover:bg-teal-300'
              }`}
            >
              {isPlayingNoise ? '⏹️ Stop Audio' : '▶️ Play Soundscape'}
            </button>
          </div>
        );

      case 'grove': {
        const currentTree = grove[grove.length - 1] || null;
        return (
          <div className="flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">🌲 The Grove</span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <StarIcon className="w-3 h-3 fill-amber-300" /> {stats.goldenSeeds} seeds
              </span>
            </div>

            <div className="flex flex-col items-center justify-center my-auto text-center">
              <span className="text-3xl mb-1">{currentTree?.type === 'pine' ? '🌲' : currentTree?.type === 'cherry' ? '🌸' : '🌳'}</span>
              <p className="text-xs font-bold text-white capitalize">{currentTree?.type || 'Oak'} Tree</p>
              <p className="text-[10px] text-white/50 font-mono">Stage {currentTree?.growthPoints || 0}/{currentTree?.maxGrowth || 10}</p>
            </div>

            <button
              onClick={onPlantSeed}
              disabled={stats.goldenSeeds === 0}
              className="w-full py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              🌱 Plant Seed
            </button>
          </div>
        );
      }

      case 'scratchpad':
        return (
          <div className="flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">📝 Scratchpad</span>
              <span className="text-[10px] text-white/40 font-mono">Auto-saved</span>
            </div>

            <textarea
              value={scratchpadNotes}
              onChange={e => setScratchpadNotes(e.target.value)}
              placeholder="Log fleeting thoughts or distractions..."
              className="w-full flex-1 min-h-[90px] bg-transparent border-none text-xs text-white placeholder:text-white/30 focus:outline-none resize-none font-mono"
            />
          </div>
        );

      case 'zen_minute':
        return (
          <div className="flex flex-col items-center justify-between h-full text-center gap-2">
            <div className="w-full flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">🧘 Zen Minute</span>
              <span className="text-[10px] text-teal-400 font-mono">Mindfulness</span>
            </div>

            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-full border-2 border-teal-400/80 bg-teal-400/10 flex items-center justify-center my-auto"
            >
              <span className="text-lg">✨</span>
            </motion.div>

            <button
              onClick={() => setIsMindfulMinuteOpen(true)}
              className="w-full py-1.5 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-xs font-bold transition-colors"
            >
              Start Breathing
            </button>
          </div>
        );

      case 'voice_memo':
        return <VoiceMemoWidget onAddTask={onAddTask} tasks={tasks} />;

      default:
        return <div className="p-4 text-xs text-white/60">Widget placeholder</div>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Workspace Toolbar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4 text-teal-400" /> Agndex Workspace Canvas
          </span>
          {isEditMode && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/30">
              Editing Canvas
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <>
              <button
                onClick={() => setIsAddWidgetDrawerOpen(true)}
                className="px-3 py-1 rounded-xl bg-teal-400 text-black text-xs font-bold flex items-center gap-1 hover:bg-teal-300 transition-colors shadow-md"
              >
                <PlusIcon className="w-3.5 h-3.5" /> Add Widget
              </button>

              <button
                onClick={resetToDefaultLayout}
                className="px-2.5 py-1 rounded-xl bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors"
              >
                Reset Default
              </button>
            </>
          )}

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isEditMode
                ? 'bg-emerald-500 text-black shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isEditMode ? '✓ Done Editing' : '⚙️ Customize Canvas'}
          </button>
        </div>
      </div>

      {/* Responsive Multi-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleWidgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            isEditMode={isEditMode}
            onRemove={removeWidget}
            onResize={resizeWidget}
          >
            {renderWidgetContent(widget)}
          </WidgetCard>
        ))}
      </div>
    </div>
  );
};
