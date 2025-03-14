import { createContext } from "react";

const AuthContext = createContext();

function AuthContextProvider({children}) {
  return (
    <AuthContext.Provider>{children}</AuthContext.Provider>
  )
}

export { AuthContextProvider };
export default AuthContext;