import MRAThemeContext from "@/contexts/theme/MRAThemeContext";
import { useContext } from "react";

export default function MRAThemeHook() {
  return useContext(MRAThemeContext);
}
