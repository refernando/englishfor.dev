'use client';

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children, isLogged }) {
  const [userData, setUserData] = useState([]);

  return <AuthContext.Provider value={{ isLogged, userData, setUserData }}>{children}</AuthContext.Provider>;
}
