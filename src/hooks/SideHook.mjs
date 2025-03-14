import SidebarContext from '@/contexts/SidebarContext'
import { useContext } from 'react'

export default function SideHook() {
  return useContext(SidebarContext);
}
