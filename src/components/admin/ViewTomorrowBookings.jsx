import React, { useEffect, useState } from "react";
import "./ViewTomorrowBookings.css";
import { useNavigate } from "react-router-dom";

const ViewTomorrowBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin-auth/check`, {
        credentials: "include"
      });
      const result = await res.json();

      if (!result.authenticated) {
        navigate("/admin");
        return;
      }

      await fetchTomorrowBookings();
    } catch (err) {
      console.error("Admin check failed:", err);
      navigate("/admin");
    }
  };

  const fetchTomorrowBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/tomorrow`, {
        credentials: "include"
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        console.error("Expected array but got:", data);
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching tomorrow's bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["Name", "Phone", "Date", "Time", "People", "Payment ID", "Status"],
      ...bookings.map((b) => [
        b.name,
        b.phone,
        b.date,
        b.time,
        b.people,
        b.paymentId || "N/A",
        "Paid"
      ])
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tomorrow_Bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="tomorrow-bookings-page">
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="back-button"
      >
        ← Back to Home
      </button>
      <h2>📅 Tomorrow's Bookings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings for tomorrow.</p>
      ) : (
        <>
          <button className="export-button" onClick={exportCSV}>
            📤 Export CSV
          </button>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>People</th>
                  <th>Payment ID</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={i}>
                    <td>{b.name}</td>
                    <td>{b.phone}</td>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td>{b.people}</td>
                    <td>{b.paymentId || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewTomorrowBookings;
