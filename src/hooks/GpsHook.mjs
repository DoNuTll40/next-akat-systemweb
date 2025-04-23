import GpsContext from "../contexts/GpsContext";
import { useContext } from "react";

export default function GpsHook() {
  return useContext(GpsContext)
}