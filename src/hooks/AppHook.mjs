import AppContext from "@/contexts/AppContext";
import { useContext } from "react";

export default function AppHook() {
  return useContext(AppContext);
}
