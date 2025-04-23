import axios from "@/configs/axios.mjs";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const AuthContext = createContext();

function AuthContextProvider({ children }) {
  const [showModalOtp, setShowModalOtp] = useState(false);
  const [errMsg, setErrMsg] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [inputLogin, setInputLogin] = useState({
    username: "",
    password: "",
  });

  const router = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem("token"));

    verify();

  }, [])

  const login = async () => {
    const rs = await axios.post("auth/authLogin", inputLogin);
    return rs
  }

  const verify = async () => {
    setLoading(true)
    const tokenBearer = localStorage.getItem("token")
    setToken(tokenBearer)

    if(!tokenBearer){
      return setLoading(false);
    }

    try {
      const  rs = await axios.post("/auth/authVerifyToken", {}, {
        headers: {
          Authorization: `Bearer ${tokenBearer}`
        }
      })

      if(rs.status === 200){
        setUser(rs.data.data)
        localStorage.setItem("isAuthen", JSON.stringify(rs.data?.data))
      }
    } catch (err) {
      toast.error(err.response?.data.message);
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthen");
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const rs = await axios.post("/auth/authLogout", {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }) 

      if(rs.status === 200){
        toast.success(rs.data?.message);
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthen");
        router.push("/admin/auth/login")
        setToken(null)
        setUser(null)
      }
    } catch (err) {
      toast.error(err.response?.data.message);
    } finally {
      setLoading(false)
    }
  }

  const value = { inputLogin, setInputLogin, showModalOtp, setShowModalOtp, login, verify, logout, user, loading, setLoading, setToken, errMsg, setErrMsg };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContextProvider };
export default AuthContext;
