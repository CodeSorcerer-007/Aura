import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdaptiveSlider } from '../components/watermelon/AdaptiveSlider';
import { ShuffledPinnedList } from '../components/watermelon/ShuffledPinnedList';
import { CardSwipeDeck } from '../components/watermelon/CardSwipeDeck';
import { CareerBlocks } from '../components/watermelon/CareerBlocks';
import { defaultCategories } from '../utils/helpers';
import { Task, CareerProfile } from '../types';

describe('AdaptiveSlider (Watermelon UI Component)', () => {
  it('renders slider track and handles keyboard arrow navigation', () => {
    const onChange = vi.fn();
    render(
      <AdaptiveSlider
        value={25}
        min={15}
        max={90}
        step={5}
        onChange={onChange}
        formatLabel={v => `${v} min`}
        label="Focus Duration"
      />
    );

    expect(screen.getByText('Focus Duration')).toBeDefined();
    expect(screen.getByText('25 min')).toBeDefined();

    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(30);

    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(20);
  });
});

describe('ShuffledPinnedList (Watermelon UI Component)', () => {
  it('renders pinned tasks, shuffle button, and spotlight intention trigger', () => {
    const sampleTasks: Task[] = [
      {
        id: 't-1',
        text: 'Finish architectural spec',
        completed: false,
        priority: 3,
        category: 'Engineering',
        timeOfDay: 'morning',
        createdAt: Date.now(),
        subtasks: [],
        win: null,
        completionDate: null,
        deadline: null,
        recurring: null,
        notes: '',
        attachments: [],
        tags: [],
        isPinned: true,
        focusSessions: 0,
        isArchived: false,
      },
      {
        id: 't-2',
        text: 'Review pull request #162',
        completed: false,
        priority: 2,
        category: 'Code',
        timeOfDay: 'afternoon',
        createdAt: Date.now(),
        subtasks: [],
        win: null,
        completionDate: null,
        deadline: null,
        recurring: null,
        notes: '',
        attachments: [],
        tags: [],
        isPinned: true,
        focusSessions: 0,
        isArchived: false,
      }
    ];

    render(
      <ShuffledPinnedList
        tasks={sampleTasks}
        onToggleTask={vi.fn()}
        onTogglePin={vi.fn()}
        onFocusTask={vi.fn()}
        allCategories={defaultCategories}
      />
    );

    expect(screen.getByText('Pinned Priority (2)')).toBeDefined();
    expect(screen.getByText('Finish architectural spec')).toBeDefined();
    expect(screen.getByText('Review pull request #162')).toBeDefined();

    const shuffleBtn = screen.getByText(/Shuffle/);
    fireEvent.click(shuffleBtn);

    const spotlightBtn = screen.getByText(/Spotlight/);
    fireEvent.click(spotlightBtn);
  });
});

describe('CardSwipeDeck (Watermelon UI Component)', () => {
  it('renders top triage card and directional action triggers', () => {
    const sampleTasks: Task[] = [
      {
        id: 't-deck-1',
        text: 'Clean up indexedDB schema migrations',
        completed: false,
        priority: 3,
        category: 'Database',
        timeOfDay: 'morning',
        createdAt: Date.now(),
        subtasks: [],
        win: null,
        completionDate: null,
        deadline: null,
        recurring: null,
        notes: '',
        attachments: [],
        tags: [],
        isPinned: false,
        focusSessions: 0,
        isArchived: false,
      }
    ];

    const onComplete = vi.fn();
    const onArchive = vi.fn();
    const onFocus = vi.fn();
    const onTogglePin = vi.fn();

    render(
      <CardSwipeDeck
        tasks={sampleTasks}
        onComplete={onComplete}
        onArchive={onArchive}
        onFocus={onFocus}
        onTogglePin={onTogglePin}
        allCategories={defaultCategories}
      />
    );

    expect(screen.getByText('🎴 Swipe Triage')).toBeDefined();
    expect(screen.getByText('Clean up indexedDB schema migrations')).toBeDefined();

    // Trigger action buttons
    fireEvent.click(screen.getByText('Done'));
    expect(onComplete).toHaveBeenCalledWith('t-deck-1');

    fireEvent.click(screen.getByText('Defer'));
    expect(onArchive).toHaveBeenCalledWith('t-deck-1');

    fireEvent.click(screen.getByText('Focus'));
    expect(onFocus).toHaveBeenCalledWith('t-deck-1');

    fireEvent.click(screen.getByText('Pin'));
    expect(onTogglePin).toHaveBeenCalledWith('t-deck-1');
  });
});

describe('CareerBlocks (Watermelon UI Component)', () => {
  it('renders career profile, velocity gauge, and quarterly goals', () => {
    const profile: CareerProfile = {
      role: 'Staff Product Engineer',
      level: 'L7 • Distinguished Fellow',
      currentQuarter: 'Q3 2026',
      velocityScore: 98,
      goals: [
        { id: 'g-100', title: 'Publish Agndex Design Pattern Spec', category: 'Design', quarter: 'Q3 2026', completed: false, progress: 80 }
      ],
      milestones: []
    };

    const onToggleGoal = vi.fn();

    render(
      <CareerBlocks
        careerProfile={profile}
        onToggleGoal={onToggleGoal}
      />
    );

    expect(screen.getByText('Staff Product Engineer')).toBeDefined();
    expect(screen.getByText('L7 • Distinguished Fellow')).toBeDefined();
    expect(screen.getByText('98')).toBeDefined();
    expect(screen.getByText('Publish Agndex Design Pattern Spec')).toBeDefined();

    fireEvent.click(screen.getByText('Publish Agndex Design Pattern Spec'));
    expect(onToggleGoal).toHaveBeenCalledWith('g-100');
  });
});
