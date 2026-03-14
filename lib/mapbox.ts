const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export const hasMapbox = Boolean(token);

/**
 * Returns a Mapbox Static API URL for a given coordinate.
 * Renders at 2× resolution for retina displays.
 * Pin color: umber (#7A5C3E).
 */
export function staticMapUrl(
  lng: number,
  lat: number,
  width = 600,
  height = 280,
  zoom = 14
): string {
  const pin = `pin-s+7A5C3E(${lng},${lat})`;
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${pin}/${lng},${lat},${zoom}/${width}x${height}@2x?access_token=${token}`;
}
