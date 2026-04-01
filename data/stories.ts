export type Story = {
  slug: string;
  title: string;
  dek: string;
  theme: string;
  /** `'history'` (essays) or `'guide'` (practical). Omitted in static fallback = treat as history. */
  type?: "history" | "guide";
};

export const stories: Story[] = [
  {
    slug: "rooms-of-light",
    title: "Rooms of Light in a Forest Village",
    dek: "On the quiet interiors and improvised studios that shaped Barbizon’s way of looking.",
    theme: "Studio",
    type: "history",
  },
  {
    slug: "paths-to-the-forest",
    title: "Paths to the Forest Edge",
    dek: "A short cartography of the routes that lead from stone streets to weathered rock.",
    theme: "Landscape",
    type: "history",
  }
];

export function getAllStories(): Story[] {
  return stories;
}

