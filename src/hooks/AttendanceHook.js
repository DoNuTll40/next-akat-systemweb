import AttendanceContext from "@/contexts/AttendanceContext";
import { useContext } from "react";

export default function AttendanceHook() {
  return useContext(AttendanceContext);
}
