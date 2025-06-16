import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookingForm from "./components/BookingForm";
import BookingConfirm from "./components/BookingConfirm";
import BookingSuccess from "./components/BookingSuccess";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import ViewTomorrowBookings from "./components/admin/ViewTomorrowBookings";
import ViewAllBookings from "./components/admin/ViewAllBookings";
import ViewFailedBookings from "./components/admin/ViewFailedBookings";

function App() {
  return (
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<BookingForm />} />
        <Route path="/confirm" element={<BookingConfirm />} />
        <Route path="/success" element={<BookingSuccess />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/tomorrow" element={<ViewTomorrowBookings />} />
        <Route path="/admin/all" element={<ViewAllBookings />} />
        <Route path="/admin/failed" element={<ViewFailedBookings />} />
      </Routes>
    </Router>
  );
}

export default App;
