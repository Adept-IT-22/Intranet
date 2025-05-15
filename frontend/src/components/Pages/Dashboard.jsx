import { Outlet, Link } from "react-router-dom";
import { FaTh, FaUsers, FaBullhorn, FaComments, FaPeopleCarry, FaLaptop, FaCalendarAlt, FaBook } from "react-icons/fa";

export default function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "80px", backgroundColor: "#8a2be2", color: "white", height: "100vh", paddingTop: "10px" }}>
        <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", fontSize: "1.5rem" }}>
          <Link to="/" title="Dashboard Home" style={{ color: "white" }}><FaTh /></Link>
          <Link to="/employee-directory" title="Employee Directory" style={{ color: "white" }}><FaUsers /></Link>
          <Link to="/announcements" title="Announcements" style={{ color: "white" }}><FaBullhorn /></Link>
          <Link to="/chats" title="Chats" style={{ color: "white" }}><FaComments /></Link>
          <Link to="/teams" title="Teams" style={{ color: "white" }}><FaPeopleCarry /></Link>
          <Link to="/it-support" title="IT Support" style={{ color: "white" }}><FaLaptop /></Link>
          <Link to="/calendar" title="Calendar" style={{ color: "white" }}><FaCalendarAlt /></Link>
          <Link to="/lms" title="LMS" style={{ color: "white" }}><FaBook /></Link>
        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}
