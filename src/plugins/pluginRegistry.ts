import { AuraPlugin, WidgetType } from '../types';
import { getDBItem, setDBItem } from '../utils/db';

export const BUILTIN_PLUGINS: AuraPlugin[] = [
  {
    id: 'core-card-triage',
    name: 'Card Swipe Triage Deck',
    version: '1.0.0',
    description: 'Tactile swipeable card deck to rapidly complete, defer, pin, or focus on tasks using gestures and keyboard arrows.',
    icon: '🎴',
    author: 'Aura Core / Watermelon UI',
    enabled: true,
    builtin: true,
    category: 'productivity',
    providedWidgets: ['triage_deck'],
    settings: [
      { key: 'soundFeedback', label: 'Sound on Swipe Complete', type: 'boolean', value: true },
      { key: 'autoAdvance', label: 'Auto Advance Next Card', type: 'boolean', value: true },
    ]
  },
  {
    id: 'core-shuffled-pinned',
    name: 'Shuffled Pinned Deck',
    version: '1.0.0',
    description: 'Watermelon UI spring-animated pinned task deck with one-click MIT intention spotlight and deck shuffling.',
    icon: '📌',
    author: 'Aura Core / Watermelon UI',
    enabled: true,
    builtin: true,
    category: 'productivity',
    providedWidgets: ['shuffled_pinned'],
    settings: [
      { key: 'maxVisiblePinned', label: 'Max Visible Cards in Deck', type: 'number', value: 5 },
    ]
  },
  {
    id: 'core-career-blocks',
    name: 'Career & Milestone Roadmap',
    version: '1.0.0',
    description: 'Bento craft blocks tracking quarterly objectives, career progression, velocity rating, and skill leveling.',
    icon: '🏆',
    author: 'Aura Core / Watermelon UI',
    enabled: true,
    builtin: true,
    category: 'gamification',
    providedWidgets: ['career_blocks'],
  },
  {
    id: 'core-ambient-audio',
    name: 'Tone.js Ambient Soundscapes',
    version: '1.0.0',
    description: 'Dynamic offline sound synthesis generating soothing Brown, Pink, and White noise focus environments.',
    icon: '🎧',
    author: 'Aura Core',
    enabled: true,
    builtin: true,
    category: 'audio',
    providedWidgets: ['ambient'],
    settings: [
      { key: 'defaultNoiseType', label: 'Default Noise Profile', type: 'select', value: 'brown', options: [
        { label: 'Brown Noise (Deep Focus)', value: 'brown' },
        { label: 'Pink Noise (Balanced Flow)', value: 'pink' },
        { label: 'White Noise (Crisp Silence)', value: 'white' },
      ]},
    ]
  },
  {
    id: 'core-zen-mindfulness',
    name: 'Zen Mindful Minute',
    version: '1.0.0',
    description: 'Interactive box-breathing sphere with guided mindfulness prompts to reset focus between deep work sprints.',
    icon: '🧘',
    author: 'Aura Core',
    enabled: true,
    builtin: true,
    category: 'lifestyle',
    providedWidgets: ['zen_minute'],
  },
  {
    id: 'core-analytics-pro',
    name: 'Productivity Momentum & Metrics',
    version: '1.0.0',
    description: 'Real-time velocity gauges, 14-day completion trend, and workday capacity warning monitor.',
    icon: '📊',
    author: 'Aura Core',
    enabled: true,
    builtin: true,
    category: 'analytics',
    providedWidgets: ['momentum'],
  }
];

class PluginRegistry {
  private plugins: Map<string, AuraPlugin> = new Map();
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    // Load saved plugin states from IndexedDB
    try {
      const savedPlugins = await getDBItem<AuraPlugin[]>('aura-plugins');
      if (savedPlugins && Array.isArray(savedPlugins)) {
        savedPlugins.forEach(p => this.plugins.set(p.id, p));
      }
    } catch (e) {
      console.warn('Failed to load plugin configurations from DB:', e);
    }

    // Merge default builtins
    BUILTIN_PLUGINS.forEach(builtin => {
      if (!this.plugins.has(builtin.id)) {
        this.plugins.set(builtin.id, builtin);
      } else {
        // Update meta while preserving user enabled state & settings
        const existing = this.plugins.get(builtin.id)!;
        this.plugins.set(builtin.id, {
          ...builtin,
          enabled: existing.enabled,
          settings: existing.settings || builtin.settings,
        });
      }
    });

    this.initialized = true;
  }

  public getAllPlugins(): AuraPlugin[] {
    return Array.from(this.plugins.values());
  }

  public getPlugin(id: string): AuraPlugin | undefined {
    return this.plugins.get(id);
  }

  public isPluginEnabled(id: string): boolean {
    const plugin = this.plugins.get(id);
    return plugin ? plugin.enabled : true;
  }

  public async togglePlugin(id: string, enabled?: boolean): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;

    const nextState = enabled !== undefined ? enabled : !plugin.enabled;
    plugin.enabled = nextState;
    this.plugins.set(id, { ...plugin });

    await this.persist();
    return nextState;
  }

  public async updatePluginSetting(id: string, key: string, value: any): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin || !plugin.settings) return;

    plugin.settings = plugin.settings.map(s => s.key === key ? { ...s, value } : s);
    this.plugins.set(id, { ...plugin });

    await this.persist();
  }

  public isWidgetAvailable(widgetType: WidgetType): boolean {
    for (const plugin of this.plugins.values()) {
      if (plugin.providedWidgets?.includes(widgetType)) {
        return plugin.enabled;
      }
    }
    return true; // Default core widgets
  }

  private async persist(): Promise<void> {
    await setDBItem('aura-plugins', Array.from(this.plugins.values()));
  }
}

export const pluginRegistry = new PluginRegistry();
