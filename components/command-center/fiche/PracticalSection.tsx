import { OpeningHoursEditor } from "@/components/command-center/OpeningHoursEditor";
import type { OpeningHoursObject } from "@/lib/openingHours";
import { FicheSection, FieldLabel, fieldInputClass } from "./shared";

// docs/ccc-v3-fiche-plan.md §3.4 — address/phone/website/booking_url
// (accommodation only) + the opening_hours jsonb editor.
export function PracticalSection({
  address,
  onAddressChange,
  phone,
  onPhoneChange,
  website,
  onWebsiteChange,
  bookingUrl,
  onBookingUrlChange,
  showBookingUrl,
  openingHours,
  onOpeningHoursChange,
}: {
  address: string;
  onAddressChange: (next: string) => void;
  phone: string;
  onPhoneChange: (next: string) => void;
  website: string;
  onWebsiteChange: (next: string) => void;
  bookingUrl: string;
  onBookingUrlChange: (next: string) => void;
  showBookingUrl: boolean;
  openingHours: OpeningHoursObject | null;
  onOpeningHoursChange: (next: OpeningHoursObject) => void;
}) {
  return (
    <FicheSection title="Informations pratiques">
      <div>
        <FieldLabel htmlFor="fiche-address">Adresse</FieldLabel>
        <input
          id="fiche-address"
          className={fieldInputClass}
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="fiche-phone">Téléphone</FieldLabel>
          <input
            id="fiche-phone"
            className={fieldInputClass}
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel htmlFor="fiche-website">Site web</FieldLabel>
          <input
            id="fiche-website"
            className={fieldInputClass}
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
          />
        </div>
      </div>

      {showBookingUrl ? (
        <div>
          <FieldLabel htmlFor="fiche-booking">
            Lien de réservation (Booking.com / Airbnb)
          </FieldLabel>
          <input
            id="fiche-booking"
            className={fieldInputClass}
            value={bookingUrl}
            onChange={(e) => onBookingUrlChange(e.target.value)}
          />
        </div>
      ) : null}

      <div>
        <FieldLabel>Horaires</FieldLabel>
        <OpeningHoursEditor value={openingHours} onChange={onOpeningHoursChange} />
      </div>
    </FicheSection>
  );
}
