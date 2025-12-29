console.log('bookingCalendar.jsx loaded');
const { useState, useEffect } = React;

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nextDaysUntilMonths(months) {
  const arr = [];
  const today = new Date();
  const end = new Date(today);
  end.setMonth(end.getMonth() + months);
  let curr = new Date(today);
  while (curr <= end) {
    arr.push(formatDate(curr));
    curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
  }
  return arr;
}

function MiniRoomRow({ room, days, selectedRange, onSelectRoom }) {
  const openSet = new Set(Array.isArray(room.availability?.open) ? room.availability.open : []);

  // Build bookedSet supporting two formats:
  // 1) array of date strings
  // 2) array of ranges { checkIn, checkOut }
  const bookedSet = new Set();
  const bookedArr = room.availability?.booked;
  if (Array.isArray(bookedArr)) {
    bookedArr.forEach((entry) => {
      if (!entry) return;
      if (typeof entry === 'string') {
        bookedSet.add(entry);
      } else if (entry.checkIn && entry.checkOut) {
        const begin = new Date(entry.checkIn);
        const end = new Date(entry.checkOut);
        let cur = new Date(begin);
        while (cur < end) {
          bookedSet.add(formatDate(cur));
          cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
        }
      }
    });
  }

  return (
    <div onClick={() => onSelectRoom(room._id || room.id)} style={{ border: '1px solid #ddd', marginBottom: 10, padding: 8, cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{room.roomName || room.name || 'Unnamed Room'}</strong>
          <div style={{ fontSize: 12, color: '#666' }}>{room.status || 'status unknown'}</div>
        </div>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: 'green', marginRight: 8 }}>● available</span>
          <span style={{ color: 'red' }}>● booked</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 4, marginTop: 8, overflowX: 'auto' }}>
        {days.map((d) => {
          const isBooked = bookedSet.has(d);
          const isOpen = openSet.has(d);
          // Green for available, red for unavailable (booked or not offered)
          const bg = isOpen && !isBooked ? '#d4edda' : '#f8d7da';
          const title = isBooked ? 'Booked' : isOpen ? 'Available' : 'Not Offered';
          // highlight selected range
          let extraStyle = {};
          if (selectedRange && selectedRange.start && selectedRange.end) {
            if (d >= selectedRange.start && d <= selectedRange.end) {
              // conflict if any day in range is unavailable
              const conflict = !(isOpen && !isBooked);
              extraStyle = { outline: conflict ? '2px solid #ff6b6b' : '2px solid #4f83f6' };
            }
          }
          return (
            <div key={d} title={title} style={{ background: bg, padding: '6px 4px', fontSize: 11, textAlign: 'center', borderRadius: 4, ...extraStyle }}>
              {d.slice(5)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingCalendar({ roomId = null }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectionConflicts, setSelectionConflicts] = useState([]);
  const days = nextDaysUntilMonths(6); // show next 6 months

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (roomId) {
          // Single-room page: fetch availability for this room and minimal room data
          const from = days[0];
          const to = days[days.length - 1];
          const availRes = await fetch(`/rooms/${roomId}/availability?from=${from}&to=${to}`);
          if (!availRes.ok) throw new Error('Failed to fetch room availability');
          const avail = await availRes.json();
          // attempt to fetch room metadata from /rooms/data to get roomName/status
          let meta = {};
          try {
            const metaRes = await fetch('/rooms/data');
            if (metaRes.ok) {
              const metaJson = await metaRes.json();
              const found = (metaJson.rooms || []).find(r => (r._id || r.id) === roomId);
              if (found) meta = found;
            }
          } catch (e) {
            // ignore metadata errors
          }
          if (mounted) {
            setRooms([{ ...(meta || {}), availability: avail }]);
            setLoading(false);
          }
        } else {
          const res = await fetch('/rooms/data');
          if (!res.ok) throw new Error('Failed to fetch rooms');
          const data = await res.json();
          if (mounted) {
            setRooms(Array.isArray(data.rooms) ? data.rooms : []);
            setLoading(false);
          }
        }
      } catch (e) {
        if (mounted) {
          setError(e.message || 'Error');
          setLoading(false);
        }
      }
    }
    load();
    return () => (mounted = false);
  }, [roomId]);

  // compute conflicts whenever selection or selectedRoom changes
  useEffect(() => {
    if (!selectedRoom || !startDate || !endDate) {
      setSelectionConflicts([]);
      return;
    }
    const room = rooms.find(r => (r._id || r.id) === selectedRoom);
    if (!room) return setSelectionConflicts([]);

    // build availability sets like in MiniRoomRow
    const openSet = new Set(Array.isArray(room.availability?.open) ? room.availability.open : []);
    const bookedSet = new Set();
    const bookedArr = room.availability?.booked;
    if (Array.isArray(bookedArr)) {
      bookedArr.forEach((entry) => {
        if (!entry) return;
        if (typeof entry === 'string') bookedSet.add(entry);
        else if (entry.checkIn && entry.checkOut) {
          let cur = new Date(entry.checkIn);
          const end = new Date(entry.checkOut);
          while (cur < end) {
            bookedSet.add(formatDate(cur));
            cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
          }
        }
      });
    }

    const conflicts = [];
    let cur = new Date(startDate);
    const end = new Date(endDate);
    while (cur <= end) {
      const d = formatDate(cur);
      const isOpen = openSet.has(d);
      const isBooked = bookedSet.has(d);
      if (!(isOpen && !isBooked)) conflicts.push(d);
      cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
    }
    setSelectionConflicts(conflicts);
  }, [selectedRoom, startDate, endDate, rooms]);

  if (loading) return <div>Loading availability…</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  // If react-day-picker is available, render it for the selected room or first room
  const DayPickerGlobal = window.ReactDayPicker || window.DayPicker || null;
  if (DayPickerGlobal) {
    // Render a DayPicker with modifiers for available/booked days and range selection
    const DayPicker = DayPickerGlobal.DayPicker || DayPickerGlobal;

    // If a particular room is selected (or only one room in list), pick that room's availability
    const roomToShow = selectedRoom ? rooms.find(r => (r._id || r.id) === selectedRoom) : (rooms.length === 1 ? rooms[0] : null);

    // Build sets for modifiers
    const modifiers = { available: [], booked: [] };
    if (roomToShow) {
      const open = Array.isArray(roomToShow.availability?.open) ? roomToShow.availability.open : [];
      const bookedRaw = roomToShow.availability?.booked || [];
      const bookedDates = [];
      bookedRaw.forEach(entry => {
        if (!entry) return;
        if (typeof entry === 'string') bookedDates.push(new Date(entry));
        else if (entry.checkIn && entry.checkOut) {
          let cur = new Date(entry.checkIn);
          const end = new Date(entry.checkOut);
          while (cur < end) { bookedDates.push(new Date(cur)); cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000); }
        }
      });
      modifiers.available = open.map(d => new Date(d));
      modifiers.booked = bookedDates;
    }

    // selected range object for DayPicker v8
    const selectedRange = (startDate && endDate) ? { from: new Date(startDate), to: new Date(endDate) } : undefined;

    return (
      <div>
        <p style={{ marginTop: 0, color: '#333' }}>Showing availability for the next {Math.ceil(days.length / 30)} months ({days.length} days).</p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <label>
            Select room:
            <select value={selectedRoom || ''} onChange={(e) => setSelectedRoom(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="">— all rooms —</option>
              {rooms.map(r => (
                <option key={r._id || r.id} value={r._id || r.id}>{r.roomName || r.name}</option>
              ))}
            </select>
          </label>

          <label>
            From:
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ marginLeft: 6 }} />
          </label>

          <label>
            To:
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ marginLeft: 6 }} />
          </label>

          <div style={{ marginLeft: 'auto', fontSize: 13 }}>
            <span style={{ background: '#d4edda', padding: '4px 8px', borderRadius: 4, marginRight: 8 }}>Available</span>
            <span style={{ background: '#f8d7da', padding: '4px 8px', borderRadius: 4 }}>Unavailable</span>
          </div>
        </div>

        {startDate && endDate && (
          <div style={{ marginBottom: 8 }}>
            {selectionConflicts.length === 0 ? (
              <span style={{ color: 'green' }}>Selected range is fully available.</span>
            ) : (
              <span style={{ color: '#b02a37' }}>Conflicts on: {selectionConflicts.join(', ')}</span>
            )}
          </div>
        )}

        <div>
          <DayPicker
            mode="range"
            numberOfMonths={6}
            defaultMonth={new Date()}
            selected={selectedRange}
            onSelect={(range) => {
              if (!range) { setStartDate(''); setEndDate(''); return; }
              const from = range.from ? formatDate(range.from) : '';
              const to = range.to ? formatDate(range.to) : from;
              setStartDate(from);
              setEndDate(to);
            }}
            modifiers={modifiers}
            modifiersClassNames={{ available: 'rdp-available', booked: 'rdp-booked' }}
          />
        </div>

        <style>{`.rdp-available .rdp-button { background:#d4edda; } .rdp-booked .rdp-button { background:#f8d7da; }`}</style>
      </div>
    );
  }

  // Fallback to simple grid if DayPicker not present
  return (
    <div>
      <p style={{ marginTop: 0, color: '#333' }}>Showing availability for the next {Math.ceil(days.length / 30)} months ({days.length} days).</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <label>
          Select room:
          <select value={selectedRoom || ''} onChange={(e) => setSelectedRoom(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="">— all rooms —</option>
            {rooms.map(r => (
              <option key={r._id || r.id} value={r._id || r.id}>{r.roomName || r.name}</option>
            ))}
          </select>
        </label>

        <label>
          From:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ marginLeft: 6 }} />
        </label>

        <label>
          To:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ marginLeft: 6 }} />
        </label>

        <div style={{ marginLeft: 'auto', fontSize: 13 }}>
          <span style={{ background: '#d4edda', padding: '4px 8px', borderRadius: 4, marginRight: 8 }}>Available</span>
          <span style={{ background: '#f8d7da', padding: '4px 8px', borderRadius: 4 }}>Unavailable</span>
        </div>
      </div>

      {startDate && endDate && (
        <div style={{ marginBottom: 8 }}>
          {selectionConflicts.length === 0 ? (
            <span style={{ color: 'green' }}>Selected range is fully available.</span>
          ) : (
            <span style={{ color: '#b02a37' }}>Conflicts on: {selectionConflicts.join(', ')}</span>
          )}
        </div>
      )}

      {rooms.length === 0 && <div>No rooms found.</div>}
      {rooms.map((r) => (
        <MiniRoomRow key={r._id || r.id || r.roomName} room={r} days={days} selectedRange={startDate && endDate ? { start: startDate, end: endDate } : null} onSelectRoom={(id) => setSelectedRoom(id)} />
      ))}
    </div>
  );
}

// Mount on #calendar_all OR #room_calendar (per-room)
const mountAll = document.getElementById('calendar_all');
const mountRoom = document.getElementById('room_calendar');

if (mountAll) {
  try {
    const root = ReactDOM.createRoot(mountAll);
    root.render(React.createElement(BookingCalendar, {}));
  } catch (err) {
    console.error('Error mounting BookingCalendar on #calendar_all', err);
  }
} else if (mountRoom) {
  // room_calendar should have data-room_id attribute
  const roomId = mountRoom.dataset.room_id || mountRoom.getAttribute('data-room_id');
  if (!roomId) {
    console.warn('room_calendar found but room id missing');
  }
  try {
    const root = ReactDOM.createRoot(mountRoom);
    root.render(React.createElement(BookingCalendar, { roomId }));
  } catch (err) {
    console.error('Error mounting BookingCalendar on #room_calendar', err);
  }
} else {
  console.warn('bookingCalendar mount node not found: #calendar_all or #room_calendar');
}
