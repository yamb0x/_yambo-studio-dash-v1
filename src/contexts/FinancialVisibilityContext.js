import React, { createContext, useState, useContext, useEffect } from 'react';

const FinancialVisibilityContext = createContext();

export function FinancialVisibilityProvider({ children }) {
  const [showFinancialInfo, setShowFinancialInfo] = useState(() => {
    // Initialize state from localStorage, defaulting to true if not set
    const stored = localStorage.getItem('showFinancialInfo');
    return stored === null ? true : JSON.parse(stored);
  });

  useEffect(() => {
    // Update localStorage when state changes
    localStorage.setItem('showFinancialInfo', JSON.stringify(showFinancialInfo));
  }, [showFinancialInfo]);

  return (
    <FinancialVisibilityContext.Provider value={{ showFinancialInfo, setShowFinancialInfo }}>
      {children}
    </FinancialVisibilityContext.Provider>
  );
}

export function useFinancialVisibility() {
  return useContext(FinancialVisibilityContext);
}