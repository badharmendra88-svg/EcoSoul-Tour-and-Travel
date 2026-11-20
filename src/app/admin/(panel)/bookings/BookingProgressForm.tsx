import { bookingStatuses, commissionStatuses } from "@/config/options";
import { updateBookingAction } from "../../partner-booking-actions";

/** Progress + settlement editor, shared with the lead page. `back` is where errors are reported. */
export function BookingProgressForm({ booking, back = "/admin/bookings/" }: { booking: { id: string; status: string; commissionStatus: string }; back?: string }) {
  return (
    <form action={updateBookingAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={booking.id} />
      <input type="hidden" name="back" value={back} />
      <select name="status" defaultValue={booking.status} className="admin-input" aria-label="Booking progress">
        {Object.entries(bookingStatuses).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <select name="commissionStatus" defaultValue={booking.commissionStatus} className="admin-input" aria-label="Commission settlement">
        {Object.entries(commissionStatuses).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <button className="btn-admin-ghost">Update</button>
    </form>
  );
}
