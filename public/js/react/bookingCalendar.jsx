const { useState, useEffect } = React;

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nextNDays(n) {
  const arr = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    arr.push(formatDate(d));
  }
  return arr;
}

function MiniRoomRow({ room, days }) {
  const openSet = new Set(Array.isArray(room.availability?.open) ? room.availability.open : []);
  const bookedSet = new Set(Array.isArray(room.availability?.booked) ? room.availability.booked : []);

  return (
    <div style={{ border: '1px solid #ddd', marginBottom: 10, padding: 8 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 4, marginTop: 8 }}>
        {days.map((d) => {
          const isBooked = bookedSet.has(d);
          const isOpen = openSet.has(d);
          const bg = isBooked ? '#f8d7da' : isOpen ? '#d4edda' : '#f0f0f0';
          const title = isBooked ? 'Booked' : isOpen ? 'Available' : 'Not Offered';
          return (
            <div key={d} title={title} style={{ background: bg, padding: '6px 4px', fontSize: 11, textAlign: 'center', borderRadius: 4 }}>
              {d.slice(5)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingCalendar() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const days = nextNDays(14); // show 14-day window

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/rooms/data');
        if (!res.ok) throw new Error('Failed to fetch rooms');
        const data = await res.json();
        if (mounted) {
          setRooms(Array.isArray(data.rooms) ? data.rooms : []);
          setLoading(false);
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
  }, []);

  if (loading) return <div>Loading availability…</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <p style={{ marginTop: 0, color: '#333' }}>Showing availability for the next {days.length} days.</p>
      {rooms.length === 0 && <div>No rooms found.</div>}
      {rooms.map((r) => (
        <MiniRoomRow key={r._id || r.id || r.roomName} room={r} days={days} />
      ))}
    </div>
  );
}

// Mount on #calendar_all
const mountNode = document.getElementById('calendar_all');
if (mountNode) {
  const root = ReactDOM.createRoot(mountNode);
  root.render(React.createElement(BookingCalendar));
} else {
  console.warn('bookingCalendar mount node not found: #calendar_all');
}
