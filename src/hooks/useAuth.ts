import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load user from localStorage on component mount
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const isOrganizer = useCallback(() => {
    return user?.roles.includes('Organizer') || false;
  }, [user]);

  const isAdmin = useCallback(() => {
    return user?.roles.includes('Admin') || false;
  }, [user]);

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isOrganizer,
    isAdmin
  };
}
