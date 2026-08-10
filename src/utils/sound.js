import * as Tone from 'tone';
import { useSettingsStore } from '../store/useSettingsStore';

export const playSoundEffect = (effect) => {
    const { soundEffectsEnabled } = useSettingsStore.getState();
    if (!soundEffectsEnabled) return;
    
    const now = Tone.now();
    Tone.start().then(() => {
        switch (effect) {
            case 'add':
                new Tone.Synth().toDestination().triggerAttackRelease("C5", "8n", now);
                break;
            case 'complete':
                new Tone.Synth().toDestination().triggerAttackRelease("E6", "8n", now);
                break;
            case 'achievement':
                new Tone.PluckSynth().toDestination().triggerAttackRelease("C7", "8n", now);
                break;
            default:
                break;
        }
    });
};
