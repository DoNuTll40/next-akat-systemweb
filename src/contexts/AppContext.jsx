import { createContext, useState } from "react";

const AppContext = createContext()

function AppContextProvider({children}) {
  const [showModalProfile, setShowModalProfile] = useState(false);
  const value = { showModalProfile, setShowModalProfile }

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  )
}

export { AppContextProvider };
export default AppContext;