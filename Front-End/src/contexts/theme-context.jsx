import { createContext } from "react";
import PropTypes from "prop-types";

const initialState = {
  theme: "light",
  setTheme: () => null,
};

export const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({ children, ...props }) {
  const value = {
    theme: "light",
    setTheme: () => null, 
  };

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
};
