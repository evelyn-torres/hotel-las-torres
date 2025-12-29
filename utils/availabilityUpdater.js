/**
 * Availability Updater
 * Ensures all rooms have availability data spanning today + 6 months
 * Call this on app startup to keep availability current
 */

import { rooms as getRoomsCollection } from '../config/mongoCollections.js';

function createAvailbyDates(begin, end) {
  let dates = { open: [], booked: [] };
  begin = new Date(begin).valueOf();
  end = new Date(end).valueOf();
  let curr = begin;
  while (curr < end) {
    let temp = new Date(curr).toISOString().slice(0, 10);
    dates.open.push(temp);
    curr += 86400000; // add a new day
  }
  return dates;
}

/**
 * Update all rooms with current availability (today + 6 months)
 * Preserves existing booked dates that fall within the new range
 */
export async function updateRoomsAvailability() {
  try {
    const roomCollection = await getRoomsCollection();
    const allRooms = await roomCollection.find({}).toArray();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sixMonthsFromNow = new Date(today);
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    console.log(`[Availability Updater] Updating ${allRooms.length} rooms for range: ${today.toISOString().slice(0, 10)} to ${sixMonthsFromNow.toISOString().slice(0, 10)}`);

    for (const room of allRooms) {
      // Create fresh availability for 6 months
      const newAvailability = createAvailbyDates(today, sixMonthsFromNow);

      // Preserve booked dates that fall within new range
      if (Array.isArray(room.availability?.booked) && room.availability.booked.length > 0) {
        const bookedSet = new Set();
        room.availability.booked.forEach(entry => {
          if (!entry) return;
          if (typeof entry === 'string') {
            // If it's a date string and within new range, keep it
            if (entry >= today.toISOString().slice(0, 10)) {
              bookedSet.add(entry);
            }
          } else if (entry.checkIn && entry.checkOut) {
            // If it's a range, expand and keep dates within new range
            let b = new Date(entry.checkIn);
            const e = new Date(entry.checkOut);
            while (b < e) {
              const dateStr = b.toISOString().slice(0, 10);
              if (dateStr >= today.toISOString().slice(0, 10)) {
                bookedSet.add(dateStr);
              }
              b = new Date(b.getTime() + 86400000);
            }
          }
        });
        newAvailability.booked = Array.from(bookedSet);

        // Remove booked dates from open
        newAvailability.open = newAvailability.open.filter(d => !bookedSet.has(d));
      }

      // Update room in database
      await roomCollection.updateOne(
        { _id: room._id },
        { $set: { availability: newAvailability } }
      );

      console.log(`[Availability Updater] Updated room "${room.roomName}": ${newAvailability.open.length} open dates, ${newAvailability.booked.length} booked dates`);
    }

    console.log('[Availability Updater] All rooms updated successfully');
    return true;
  } catch (error) {
    console.error('[Availability Updater] Error updating rooms:', error);
    return false;
  }
}

export default updateRoomsAvailability;
