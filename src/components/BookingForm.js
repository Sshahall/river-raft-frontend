import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import { useNavigate } from 'react-router-dom';

const BookingForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    people: '',
    raftId: ''
  });

  const [availableSlots, setAvailableSlots] = useState({});
  const [errors, setErrors] = useState('');
  const [bookingDisabled, setBookingDisabled] = useState(false);

  // Fetch admin booking status
  const fetchBookingStatus = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/public-booking-status");

      const data = await res.json();
      setBookingDisabled(data.disabled || false);
    } catch (err) {
      console.error("Error fetching booking status:", err);
    }
  };

  // Run only once on mount
  useEffect(() => {
    fetchBookingStatus();
  }, []);

  // Minimum booking date = tomorrow
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Fetch slot availability for selected date
  const fetchSlots = async (selectedDate) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/slots?date=${selectedDate}`);
      const data = await res.json();
      setAvailableSlots(data || {});
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots({});
    }
  };

  // Refetch slots when date changes
  useEffect(() => {
    if (formData.date) {
      fetchSlots(formData.date);
      setFormData(prev => ({
        ...prev,
        time: '',
        raftId: '',
        people: ''
      }));
    }
  }, [formData.date]);

  const getRaftsForSelectedTime = () => {
    return Array.isArray(availableSlots[formData.time]) ? availableSlots[formData.time] : [];
  };

  const getSelectedRaft = () => {
    return getRaftsForSelectedTime().find(
      raft => raft.raftId.toString() === formData.raftId
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors('');

    const selectedRaft = getSelectedRaft();
    const count = parseInt(formData.people);

    if (!selectedRaft) {
      setErrors('Please select a valid raft.');
      return;
    }

    const available = selectedRaft.available;

    if (available === 1 && count !== 1) {
      setErrors('Only 1 seat is available. You can book for 1 person only.');
      return;
    }

    if (available >= 5 && (count < 5 || count > 6)) {
      setErrors('You must book for 5 or 6 people for this raft.');
      return;
    }

    if (available < 1) {
      setErrors('This raft is already full.');
      return;
    }

    const payload = {
      name: formData.name,
      phone: formData.phone,
      date: formData.date,
      time: formData.time,
      people: count,
      raftId: parseInt(formData.raftId)
    };

    navigate('/confirm', { state: payload });
  };

  // If admin disabled booking
  if (bookingDisabled) {
    return (
      <div className="booking-container">
        <h2>Book Your River Raft</h2>
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          🚫 Bookings are currently disabled by the admin (e.g., due to weather).
        </p>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <h2>Book Your River Raft</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          required
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          required
          value={formData.phone}
          onChange={handleChange}
        />

        <input
          type="date"
          name="date"
          required
          min={getMinDate()}
          value={formData.date}
          onChange={handleChange}
        />

        <select
          name="time"
          required
          value={formData.time}
          onChange={handleChange}
        >
          <option value="">Select Time</option>
          {Object.keys(availableSlots).map(time => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        {formData.time && (
          <select
            name="raftId"
            required
            value={formData.raftId}
            onChange={handleChange}
          >
            <option value="">Select Raft</option>
            {getRaftsForSelectedTime().map(raft => {
              const { raftId, available } = raft;
              const disabled = !(available === 1 || available >= 5);
              const label = available === 0
                ? `Raft ${raftId} (Full)`
                : `Raft ${raftId} (${available} seat${available !== 1 ? 's' : ''} available)`;
              return (
                <option key={raftId} value={raftId} disabled={disabled}>
                  {label}
                </option>
              );
            })}
          </select>
        )}

        {formData.raftId && (
          <input
            type="number"
            name="people"
            required
            min={getSelectedRaft()?.available === 1 ? 1 : 5}
            max={getSelectedRaft()?.available === 1 ? 1 : 6}
            value={formData.people}
            placeholder={
              getSelectedRaft()?.available === 1
                ? 'Only 1 seat available'
                : 'Enter 5 or 6 people'
            }
            onChange={handleChange}
          />
        )}

        {errors && <p style={{ color: 'red' }}>{errors}</p>}

        <button type="submit">Submit Booking</button>
      </form>
    </div>
  );
};

export default BookingForm;
