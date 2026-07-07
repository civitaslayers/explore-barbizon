export type LightPreset = 'dawn' | 'day' | 'dusk' | 'night';

// Pass 1.5: the map's light preset is a fixed constant — no time sync, no
// user override. See docs/design-direction.md "Motion & Immersion" for the
// deferred time-synced design intent.
export const DEFAULT_LIGHT_PRESET: LightPreset = 'dawn';
