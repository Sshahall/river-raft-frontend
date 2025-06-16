import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const validateAdmin = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin-auth/check`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/admin");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/admin");
      }
    };

    const fetchDisabledStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/booking-status`, {
          credentials: "include",
        });
        const data = await res.json();
        if (typeof data.disabled === "boolean") {
          setDisabled(data.disabled);
        } else {
          console.error("Invalid disabled status:", data);
        }
      } catch (err) {
        console.error("Failed to fetch booking status:", err);
      } finally {
        setLoadingStatus(false);
      }
    };

    validateAdmin();
    fetchDisabledStatus();
  }, [navigate, API_BASE]);

  const toggleBooking = async () => {
    const newStatus = !disabled;

    try {
      const res = await fetch(`${API_BASE}/api/admin/booking-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ disabled: newStatus }),
      });

      const data = await res.json();

      if (typeof data.disabled === "boolean") {
        setDisabled(data.disabled);
      } else {
        console.error("Invalid response from toggle:", data);
      }
    } catch (err) {
      console.error("Error toggling booking status:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/admin-auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/admin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>🧑‍💼 Admin Dashboard</h2>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>

      <div className="booking-status">
        {loadingStatus ? (
          <p>Loading booking status...</p>
        ) : (
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={toggleBooking}
            />
            Disable Booking (e.g. rain)
          </label>
        )}
      </div>

      <div className="tab-buttons">
        <button onClick={() => navigate("/admin/tomorrow")}>
          📅 Tomorrow's Bookings
        </button>
        <button onClick={() => navigate("/admin/all")}>
          📖 All Bookings
        </button>
        <button onClick={() => navigate("/admin/failed")}>
          ⚠️ Failed Bookings
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
