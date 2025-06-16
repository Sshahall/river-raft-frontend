import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookingConfirm.css";

const BookingConfirm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);
  const [checkingSeats, setCheckingSeats] = useState(false);
  const [email, setEmail] = useState(state?.email || "");

  const { name, phone, date, time, people } = state || {};

  useEffect(() => {
    if (!state) navigate("/");
  }, [state, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (isPaying) navigate(1);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isPaying, navigate]);

  const handleConfirm = async () => {
    if (!email) {
      alert("Please enter your email for confirmation.");
      return;
    }

    setCheckingSeats(true);

    try {
      const res = await fetch(`https://river-raft-backend.onrender.com/api/bookings/slots?date=${date}`);
      const data = await res.json();
      const timeSlots = data[time] || [];

      let totalAvailable = 0;
      timeSlots.forEach(r => {
        totalAvailable += r.available;
      });

      if (totalAvailable < people) {
        setCheckingSeats(false);
        alert("❌ Sorry, the seats have just been booked. Kindly select another slot.");
        navigate("/booking");
        return;
      }

      setTimeout(() => {
        setCheckingSeats(false);
        setIsPaying(true);

        const options = {
          key: "rzp_test_Ig17s1VfXKpkUQ",
          amount: 1000 * 100,
          currency: "INR",
          name: "Kannur River Rafting",
          description: "Raft Booking Payment",
          image: "/logo.png",
          handler: async (response) => {
            try {
              const payload = {
                name,
                phone,
                email,
                date,
                time,
                people,
                paymentId: response.razorpay_payment_id,
              };

              const bookingRes = await fetch("https://river-raft-backend.onrender.com/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              const result = await bookingRes.json();

              if (!bookingRes.ok) {
                alert("Booking failed after payment. Please contact support.");
                setIsPaying(false);
              } else {
                navigate("/success", {
                  state: { ...payload, rafts: result.raftsUsed || [] },
                });
              }
            } catch (err) {
              alert("Error confirming booking. Please try again.");
              setIsPaying(false);
            }
          },
          prefill: {
            name,
            contact: phone,
            email,
          },
          theme: {
            color: "#0077ff",
          },
          modal: {
            ondismiss: () => {
              setIsPaying(false);
              alert("Payment cancelled.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }, 3000);

    } catch (error) {
      alert("Something went wrong while checking seats. Try again.");
      setCheckingSeats(false);
    }
  };

  if (!state) return <p>Loading booking details...</p>;

  return (
    <div className="confirm-container">
      <h2>Confirm Your Booking</h2>
      <div className="details">
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {time}</p>
        <p><strong>People:</strong> {people}</p>
        <p><strong>Place:</strong> Kannur River Rafting</p>
        <label>
          <strong>Email:</strong>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            style={{
              padding: "8px",
              marginTop: "5px",
              width: "100%",
              marginBottom: "15px"
            }}
          />
        </label>
        <p style={{ color: "red", fontStyle: "italic" }}>
          ⚠️ Seats will only be confirmed after successful payment.
        </p>
      </div>

      <button
        className="confirm-button"
        onClick={handleConfirm}
        disabled={checkingSeats || isPaying}
      >
        {checkingSeats ? (
          <>
            Checking availability <span className="spinner" />
          </>
        ) : isPaying ? (
          <>
            Processing Payment <span className="spinner" />
          </>
        ) : (
          "Confirm & Pay ₹1000"
        )}
      </button>

      <p className="close-text">⚠️ Do not refresh or close this tab during payment.</p>
    </div>
  );
};

export default BookingConfirm;
