import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Pages/Dashboard";
import Chats from "./components/Pages/Chats";
import Teams from "./components/Pages/Teams";
import EmployeeDirectory from "./components/Pages/EmployeeDirectory";
import ITSupport from "./components/Pages/ITSupport";
import Calendar from "./components/Pages/Calendar";
import LMS from "./components/Pages/LMS";
import Home from "./components/Pages/Home";
import Announcements from "./components/Pages/Announcements";
import Innovations from "./components/Pages/Innovations";
import Login from "./components/Pages/login";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Home />} />
          <Route path="chats" element={<Chats />} />
          <Route path="teams" element={<Teams />} />
          <Route path="employee-directory" element={<EmployeeDirectory />} />
          <Route path="it-support" element={<ITSupport />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="lms" element={<LMS />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="innovations" element={<Innovations />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
