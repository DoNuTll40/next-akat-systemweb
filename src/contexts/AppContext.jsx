import { createContext } from "react";

const AppContext = createContext()

function AppContextProvider({children}) {

  const value = {}

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  )
}

export { AppContextProvider };
export default AppContext;