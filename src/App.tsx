
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import Teachers from "@/pages/Teachers";
import TeacherProfile from "@/pages/TeacherProfile";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import StudentRegister from "@/pages/StudentRegister";
import Transport from "@/pages/Transport";
import Notifications from "@/pages/Notifications";
import Attendance from "@/pages/Attendance";
import NotFound from "@/pages/NotFound";
import ClassroomLogin from "@/pages/ClassroomLogin";
import Calendar from "@/pages/Calendar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/register" element={<StudentRegister />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teachers/:teacherId" element={<TeacherProfile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/scan/:roomId/:teacherId" element={<Attendance />} />
          <Route path="/classroom-login/:roomId" element={<ClassroomLogin />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
