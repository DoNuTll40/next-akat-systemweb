import AuthContext from '@/contexts/AuthContext'
import { useContext } from 'react'

export default function AuthHook() {
  return useContext(AuthContext)
}
