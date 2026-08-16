import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWidgetStore, DEFAULT_WIDGETS } from '../store/useWidgetStore';
import { pluginRegistry, BUILTIN_PLUGINS } from '../plugins/pluginRegistry';

vi.mock('../utils/db', () => ({
  getDBItem: vi.fn().mockResolvedValue(null),
  setDBItem: vi.fn().mockResolvedValue(undefined),
  setDBItemDebounced: vi.fn(),
}));

describe('useWidgetStore & Canvas Customization', () => {
  beforeEach(() => {
    useWidgetStore.setState({
      widgets: [...DEFAULT_WIDGETS],
      isEditMode: false,
      isAddWidgetDrawerOpen: false,
      scratchpadNotes: '',
    });
  });

  it('initializes with default Agndex desktop layout', () => {
    const store = useWidgetStore.getState();
    expect(store.widgets.length).toBeGreaterThan(5);
    expect(store.widgets.some(w => w.type === 'capture')).toBe(true);
    expect(store.widgets.some(w => w.type === 'triage_deck')).toBe(true);
    expect(store.widgets.some(w => w.type === 'shuffled_pinned')).toBe(true);
    expect(store.widgets.some(w => w.type === 'focus_timer')).toBe(true);
    expect(store.widgets.some(w => w.type === 'career_blocks')).toBe(true);
  });

  it('toggles edit mode for wiggle animation and resizing', () => {
    const store = useWidgetStore.getState();
    expect(store.isEditMode).toBe(false);
    store.toggleEditMode();
    expect(useWidgetStore.getState().isEditMode).toBe(true);
  });

  it('adds, resizes, and removes widgets', () => {
    const store = useWidgetStore.getState();
    const initialCount = store.widgets.length;

    // Add widget
    store.addWidget('zen_minute', 'small', 'Quick Breathing');
    const updated = useWidgetStore.getState().widgets;
    expect(updated.length).toBe(initialCount + 1);

    const added = updated.find(w => w.type === 'zen_minute');
    expect(added).toBeDefined();
    expect(added?.size).toBe('small');

    // Resize widget
    store.resizeWidget(added!.id, 'medium');
    const resized = useWidgetStore.getState().widgets.find(w => w.id === added!.id);
    expect(resized?.size).toBe('medium');

    // Remove widget
    store.removeWidget(added!.id);
    expect(useWidgetStore.getState().widgets.length).toBe(initialCount);
  });

  it('updates and toggles career goals', () => {
    const store = useWidgetStore.getState();
    const goals = store.careerProfile.goals;
    const firstGoal = goals[0];

    expect(firstGoal.completed).toBe(false);
    store.toggleCareerGoal(firstGoal.id);

    const updatedProfile = useWidgetStore.getState().careerProfile;
    const toggledGoal = updatedProfile.goals.find(g => g.id === firstGoal.id);
    expect(toggledGoal?.completed).toBe(true);
    expect(toggledGoal?.progress).toBe(100);
  });
});

describe('pluginRegistry & Addon Ecosystem', () => {
  it('registers builtin Watermelon UI and audio plugins', async () => {
    await pluginRegistry.init();
    const all = pluginRegistry.getAllPlugins();
    expect(all.length).toBeGreaterThanOrEqual(BUILTIN_PLUGINS.length);

    const triagePlugin = pluginRegistry.getPlugin('core-card-triage');
    expect(triagePlugin).toBeDefined();
    expect(triagePlugin?.enabled).toBe(true);
  });

  it('toggles plugin active state', async () => {
    await pluginRegistry.init();
    const initialState = pluginRegistry.isPluginEnabled('core-ambient-audio');
    const nextState = await pluginRegistry.togglePlugin('core-ambient-audio');
    expect(nextState).toBe(!initialState);
    expect(pluginRegistry.isPluginEnabled('core-ambient-audio')).toBe(nextState);
  });
});
