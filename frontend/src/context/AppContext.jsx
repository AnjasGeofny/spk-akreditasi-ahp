import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <AppContext.Provider value={{ sidebarOpen, setSidebarOpen, notification, showNotification }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
