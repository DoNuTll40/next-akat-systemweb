import ProtectedAttendancePage from "@/utils/protectedAttendacePage";

export default function layout({children}) {
  return (
    <ProtectedAttendancePage>{children}</ProtectedAttendancePage>
  )
}
