import { useState, createContext, useContext, useEffect } from "react";

export const ProgressContext = createContext();

export function ProgressContextProvider(props) {
  const [progressFilters, setProgressFilters] = useState({
    "date-range": "past month",
  });
  const [progressContainsFilters, setProgressContainsFilters] = useState({});

  const value = {
    progressFilters,
    setProgressFilters,
    progressContainsFilters,
    setProgressContainsFilters,
  };
  return <ProgressContext.Provider value={value} {...props} />;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  return context;
}
