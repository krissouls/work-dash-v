'use client';

import type { User } from 'firebase/auth';
import type { DataSnapshot } from 'firebase/database';
import { get, ref } from 'firebase/database';
import { database } from './firebase';
import type { AdminUser } from './types';

const FIREBASE_TIMEOUT_MS = 6000;
const FIREBASE_DISABLED_KEY = 'workdash-admin:firebase-disabled';

export function snapshotToArray<T>(snapshot: DataSnapshot): (T & { id: string })[] {
  const data = snapshot.val();

  if (!data) {
    return [];
  }

  return Object.entries(data).map(([id, value]) => ({
    id,
    ...(value as T),
  }));
}

export function snapshotToMap<T>(snapshot: DataSnapshot): Map<string, T & { id: string }> {
  return new Map(snapshotToArray<T>(snapshot).map((item) => [item.id, item]));
}

export function firebaseTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(`${label} timed out. Check Firebase database rules and URL.`));
    }, FIREBASE_TIMEOUT_MS);

    promise
      .then((value) => {
        window.clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeout);
        reject(error);
      });
  });
}

export function fallbackAdminFromUser(user: User, name?: string): AdminUser {
  return {
    id: user.uid,
    email: user.email || '',
    name: name || user.displayName || user.email?.split('@')[0] || 'Admin',
    role: 'super_admin',
    createdAt: Date.now(),
  };
}

export async function loadOrCreateAdminProfile(user: User, name?: string): Promise<AdminUser> {
  const fallbackAdmin = fallbackAdminFromUser(user, name);
  const adminRef = ref(database, `admins/${user.uid}`);

  try {
    const snapshot = await firebaseTimeout(get(adminRef), 'Admin profile lookup');

    if (snapshot.exists()) {
      window.localStorage.removeItem(FIREBASE_DISABLED_KEY);
      const adminData = snapshot.val() as Partial<AdminUser>;
      return {
        ...fallbackAdmin,
        ...adminData,
        id: adminData.id || user.uid,
        email: adminData.email || user.email || '',
        role: adminData.role || 'admin',
      };
    }

    window.localStorage.setItem(FIREBASE_DISABLED_KEY, 'true');
    return fallbackAdmin;
  } catch (error) {
    window.localStorage.setItem(FIREBASE_DISABLED_KEY, 'true');
    return fallbackAdmin;
  }
}
