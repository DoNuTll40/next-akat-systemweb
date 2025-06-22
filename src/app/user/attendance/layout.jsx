import { AttendanceContextProvider } from "@/contexts/AttendanceContext";
import ProtectedAttendancePage from "@/utils/protectedAttendacePage";

export default function layout({ children }) {
  return (
    <AttendanceContextProvider>
      <ProtectedAttendancePage>
        {children}
      </ProtectedAttendancePage>
    </AttendanceContextProvider>
  );
}
