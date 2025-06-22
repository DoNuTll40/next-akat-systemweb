import { AttendanceContextProvider } from "@/contexts/AttendanceContext";

export default function layout({ children }) {
  return (
    <>
      <AttendanceContextProvider>
        {children}
      </AttendanceContextProvider>
    </>
  );
}
