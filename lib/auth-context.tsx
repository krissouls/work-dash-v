'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { AdminUser, UserRole } from './types';
import { fallbackAdminFromUser, loadOrCreateAdminProfile } from './firebase-utils';

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  userRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        const fallbackAdmin = fallbackAdminFromUser(currentUser);

        setUser(currentUser);
        setAdminUser(fallbackAdmin);
        setUserRole(fallbackAdmin.role);
        setLoading(false);

        try {
          const adminData = await loadOrCreateAdminProfile(currentUser);

          if (isMounted) {
            setAdminUser(adminData);
            setUserRole(adminData.role);
          }
        } catch (error) {
          console.error('Error fetching admin data:', error);

          if (isMounted) {
            setAdminUser(fallbackAdmin);
            setUserRole(fallbackAdmin.role);
          }
        }
      } else {
        setUser(null);
        setAdminUser(null);
        setUserRole(null);

        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  async function logout() {
    await signOut(auth);
    setUser(null);
    setAdminUser(null);
    setUserRole(null);
  }

  const value: AuthContextType = {
    user,
    adminUser,
    loading,
    isAdmin: !!user && !!adminUser,
    logout,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
