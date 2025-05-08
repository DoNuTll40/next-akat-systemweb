import { createContext, useEffect, useState } from "react";

const MRAThemeContext = createContext();

function MRAThemeContextProvider({ children }) {
  const [themeMRA, setThemeMRA] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mra-theme");
    if (stored) setThemeMRA(JSON.parse(stored));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (themeMRA) {
      localStorage.setItem("mra-theme", JSON.stringify(themeMRA));
    }
  }, [themeMRA]);

  if (!isLoaded) return null;

  const value = { themeMRA, setThemeMRA };
  return <MRAThemeContext.Provider value={value}>{children}</MRAThemeContext.Provider>;
}

export { MRAThemeContextProvider };
export default MRAThemeContext;
