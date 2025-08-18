import React, { createContext, useContext, useState } from 'react';

interface FooterVisibilityContextType {
  showFooter: boolean;
  setShowFooter: (show: boolean) => void;
}

const FooterVisibilityContext = createContext<FooterVisibilityContextType | undefined>(undefined);

export const FooterVisibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [showFooter, setShowFooter] = useState(true);
  return (
    <FooterVisibilityContext.Provider value={{ showFooter, setShowFooter }}>
      {children}
    </FooterVisibilityContext.Provider>
  );
};

export const useFooterVisibility = () => {
  const context = useContext(FooterVisibilityContext);
  if (!context) throw new Error('useFooterVisibility must be used within FooterVisibilityProvider');
  return context;
}; 