import React, { useEffect, useState } from "react";
import "./ViewFailedBookings.css";
import { useNavigate } from "react-router-dom";

const ViewFailedBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin-auth/check", {
        credentials: "include",
      });
      const result = await res.json();

      if (!result.authenticated) {
        navigate("/admin");
        return;
      }

      await fetchFailedBookings();
    } catch (err) {
      console.error("Admin check failed:", err);
      navigate("/admin");
    }
  };

  const fetchFailedBookings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/failed-bookings", {
        credentials: "include",
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        console.error("Expected array but got:", data);
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching failed bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["Name", "Phone", "Date", "Time", "People", "Status"],
      ...bookings.map((b) => [
        b.name,
        b.phone,
        b.date,
        b.time,
        b.people,
        "Failed",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Failed_Bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="failed-bookings-page">
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="back-button"
      >
        ← Back to Home
      </button>
      <h2>⚠️ Failed Bookings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p>No failed bookings found.</p>
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
                  <th>Status</th>
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
                    <td style={{ color: "red" }}>Failed</td>
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

export default ViewFailedBookings;
