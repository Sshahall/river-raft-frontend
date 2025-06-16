import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookingSuccess.css";
import { jsPDF } from "jspdf";

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { name, phone, date, time, people, paymentId, rafts = [] } = state || {};

  useEffect(() => {
    if (!state) {
      navigate("/");
      return;
    }

    // Prevent back button after success
    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    preventBack(); // Push initial state
    window.addEventListener("popstate", preventBack);

    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, [state, navigate]);

  if (!state) return null;

  const handleDownload = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setTextColor(14, 118, 168); // LinkedIn blue
  doc.setFontSize(20);
  doc.text("Kannur River Rafting - Booking Invoice", pageWidth / 2, 20, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  let y = 40;

  doc.text(`Name: ${name}`, 20, y); y += 10;
  doc.text(`Phone: ${phone}`, 20, y); y += 10;
  doc.text(`Date: ${date}`, 20, y); y += 10;
  doc.text(`Time: ${time}`, 20, y); y += 10;
  doc.text(`People: ${people}`, 20, y); y += 10;

  doc.setTextColor(0, 128, 0);
  doc.text(`Amount Paid: Rs. 1000`, 20, y); y += 10;

  doc.setTextColor(0, 0, 0);
  doc.text(`Payment ID: ${paymentId}`, 20, y); y += 10;
  doc.text(`Status: Paid`, 20, y); y += 10;

  if (rafts.length > 0) {
    doc.setFont(undefined, 'bold');
    doc.text("Rafts Assigned:", 20, y); y += 8;
    doc.setFont(undefined, 'normal');
    rafts.forEach((r) => {
      doc.text(`• Raft ${r.raftId} — ${r.booked} seat${r.booked > 1 ? "s" : ""}`, 25, y);
      y += 8;
    });
  }

  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(85);
  doc.text("Please arrive 15 minutes early. Carry this invoice for verification.", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.text("Location: Kannur River Rafting Base Camp", pageWidth / 2, y, { align: "center" });

  doc.save(`Invoice_${name.replace(/\s+/g, "_")}_${date}.pdf`);
};


  return (
    <div className="invoice-container">
      <h2>✅ Booking Confirmed!</h2>
      <p className="thankyou-text">
        Thank you for booking with <strong>Kannur River Rafting</strong>.
      </p>

      <div className="invoice-card">
        <h3>🧾 Booking Invoice</h3>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {time}</p>
        <p><strong>People:</strong> {people}</p>
        <p><strong>Amount Paid:</strong> ₹1000</p>
        <p><strong>Payment ID:</strong> {paymentId}</p>
        <p><strong>Status:</strong> ✅ Paid</p>
        <div>
          <strong>Raft{rafts.length > 1 ? "s" : ""} Assigned:</strong>
          <ul>
            {rafts.map((raft, i) => (
              <li key={i}>
                Raft {raft.raftId} ({raft.booked} seat{raft.booked > 1 ? "s" : ""})
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="success-buttons">
        <button onClick={handleDownload}>📄 Download Invoice</button>
        <button onClick={() => navigate("/")}>🏠 Back to Home</button>
      </div>
    </div>
  );
};

export default BookingSuccess;

