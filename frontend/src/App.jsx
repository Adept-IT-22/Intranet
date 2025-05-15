import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Pages/Dashboard";
import Chats from "./components/Pages/Chats";
import Teams from "./components/Pages/Teams";
import EmployeeDirectory from "./components/Pages/EmployeeDirectory";
import ITSupport from "./components/Pages/ITSupport";
import Calendar from "./components/Pages/Calendar";
import LMS from "./components/Pages/LMS";
import Home from "./components/Pages/Home"; // If you have a Home page
import Announcements from "./components/Pages/Announcements";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>
        <Route index element={<Home />} />
        <Route path="chats" element={<Chats />} />
        <Route path="teams" element={<Teams />} />
        <Route path="employee-directory" element={<EmployeeDirectory />} />
        <Route path="it-support" element={<ITSupport />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="lms" element={<LMS />} />
        <Route path="announcements" element={<Announcements />} />
      </Route>
    </Routes>
  );
};

export default App;
