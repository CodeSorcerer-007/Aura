import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { VoiceVisualizer, AudioMemoPlayer } from '../components/common/VoiceVisualizer';
import { CaptureInput } from '../components/layout/CaptureInput';

describe('useVoiceRecorder hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default idle state', () => {
    const { result } = renderHook(() => useVoiceRecorder());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.duration).toBe(0);
    expect(result.current.audioUrl).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('allows manual transcript setting and reset', () => {
    const { result } = renderHook(() => useVoiceRecorder());

    act(() => {
      result.current.setTranscript('Review PR and submit report !urgent #engineering');
    });

    expect(result.current.transcript).toBe('Review PR and submit report !urgent #engineering');

    act(() => {
      result.current.cancelRecording();
    });

    expect(result.current.transcript).toBe('');
    expect(result.current.isRecording).toBe(false);
  });
});

describe('VoiceVisualizer Component', () => {
  it('renders recording state, duration, and triggers stop/cancel handlers', () => {
    const onStop = vi.fn();
    const onCancel = vi.fn();

    render(
      <VoiceVisualizer
        isRecording={true}
        volumeLevel={0.7}
        duration={14}
        interimTranscript="buy groceries at Whole Foods"
        onStop={onStop}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText(/Listening & Recording/i)).toBeDefined();
    expect(screen.getByText('00:14')).toBeDefined();
    expect(screen.getByText(/"buy groceries at Whole Foods"/i)).toBeDefined();

    fireEvent.click(screen.getByText('✓ Done'));
    expect(onStop).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('returns null when isRecording is false', () => {
    const { container } = render(
      <VoiceVisualizer
        isRecording={false}
        volumeLevel={0}
        duration={0}
        onStop={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});

describe('AudioMemoPlayer Component', () => {
  it('renders player controls, title, and delete button', () => {
    const onDelete = vi.fn();

    render(
      <AudioMemoPlayer
        src="blob:http://localhost/test-audio"
        duration={42}
        title="Weekly Sprint Notes"
        onDelete={onDelete}
      />
    );

    expect(screen.getByText(/Weekly Sprint Notes/i)).toBeDefined();
    expect(screen.getByText('▶')).toBeDefined();

    const deleteBtn = screen.getByTitle('Delete voice note');
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});

describe('CaptureInput with Voice Recording Trigger', () => {
  it('renders input, submit button, and microphone trigger', () => {
    const onAddTask = vi.fn();

    render(<CaptureInput onAddTask={onAddTask} />);

    const input = screen.getByPlaceholderText(/Capture a thought/i);
    expect(input).toBeDefined();

    const micBtn = screen.getByLabelText('Voice recording');
    expect(micBtn).toBeDefined();

    // Type text and submit normally
    fireEvent.change(input, { target: { value: 'Buy groceries #errands' } });
    fireEvent.submit(screen.getByLabelText('Add Task'));

    expect(onAddTask).toHaveBeenCalledWith('Buy groceries #errands');
  });
});
