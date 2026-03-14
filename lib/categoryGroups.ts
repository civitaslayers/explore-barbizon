export const GROUP_NAMES = [
  "Art & History",
  "Eat & Stay",
  "Forest & Nature",
  "Practical",
] as const;

export type GroupName = typeof GROUP_NAMES[number];

export const CATEGORY_GROUP: Record<string, GroupName> = {
  // Art & History
  "Artist House": "Art & History",
  "Museum": "Art & History",
  "Heritage Site": "Art & History",
  "Heritage Plaque": "Art & History",
  "Open-Air Museum": "Art & History",
  "Historic Paint Spot": "Art & History",
  "Galerie d'Art": "Art & History",
  "Point of Interest": "Art & History",
  "Cemetery": "Art & History",
  "Art & History": "Art & History",
  // Eat & Stay
  "Restaurant": "Eat & Stay",
  "Boutique": "Eat & Stay",
  "Boucherie": "Eat & Stay",
  "Boulangerie": "Eat & Stay",
  "Fromagerie": "Eat & Stay",
  "Epicerie": "Eat & Stay",
  "Traiteur": "Eat & Stay",
  "Salon de the": "Eat & Stay",
  "Hotel": "Eat & Stay",
  "Pharmacy": "Eat & Stay",
  "Tourist Office": "Eat & Stay",
  "Tabac / Presse": "Eat & Stay",
  "Eat, Stay & Shop": "Eat & Stay",
  // Forest & Nature
  "Trail": "Forest & Nature",
  "Forest & Nature": "Forest & Nature",
  "Climbing Area": "Forest & Nature",
  "Viewpoint": "Forest & Nature",
  // Practical
  "Parking": "Practical",
  "Bus Stop": "Practical",
  "Public Toilet": "Practical",
  "EV Charger": "Practical",
  "ATM": "Practical",
  "Practical Barbizon": "Practical",
};

export function getCategoryGroup(category: string): GroupName {
  return CATEGORY_GROUP[category] ?? "Art & History";
}

export const GROUP_COLORS: Record<GroupName, string> = {
  "Art & History": "#7A5C3E",
  "Eat & Stay":    "#5F6F52",
  "Forest & Nature": "#4A5E3A",
  "Practical":     "#888888",
};

export const GROUP_DOT_TAILWIND: Record<GroupName, string> = {
  "Art & History":   "bg-umber",
  "Eat & Stay":      "bg-moss",
  "Forest & Nature": "bg-[#4A5E3A]",
  "Practical":       "bg-ink/30",
};

export const GROUP_META: Record<GroupName, string> = {
  "Art & History":   "Studios, galleries, heritage sites",
  "Eat & Stay":      "Restaurants, cafés, hotels, shops",
  "Forest & Nature": "Trails, viewpoints, climbing areas",
  "Practical":       "Parking, transport, services",
};
