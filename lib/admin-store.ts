'use client';

import { onValue, push, ref, remove, update } from 'firebase/database';
import { database } from './firebase';
import { snapshotToArray } from './firebase-utils';

type RecordWithId = object & { id?: string };

const LOCAL_PREFIX = 'workdash-admin';
export const FIREBASE_DISABLED_KEY = `${LOCAL_PREFIX}:firebase-disabled`;

function shouldSkipFirebase() {
  return typeof window !== 'undefined' && window.localStorage.getItem(FIREBASE_DISABLED_KEY) === 'true';
}

function markFirebaseBlocked() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(FIREBASE_DISABLED_KEY, 'true');
  }
}

function storageKey(collection: string) {
  return `${LOCAL_PREFIX}:${collection}`;
}

function eventName(collection: string) {
  return `${LOCAL_PREFIX}:changed:${collection}`;
}

export function readLocalCollection<T extends RecordWithId>(collection: string): (T & { id: string })[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(storageKey(collection));

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as (T & { id: string })[];
  } catch {
    return [];
  }
}

function writeLocalCollection<T extends RecordWithId>(
  collection: string,
  records: (T & { id: string })[]
) {
  window.localStorage.setItem(storageKey(collection), JSON.stringify(records));
  window.dispatchEvent(new Event(eventName(collection)));
}

export function listenToAdminCollection<T extends RecordWithId>(
  collection: string,
  onData: (records: (T & { id: string })[]) => void,
  onFirebaseError?: (error: Error) => void
) {
  const syncLocal = () => onData(readLocalCollection<T>(collection));
  window.addEventListener(eventName(collection), syncLocal);
  syncLocal();

  if (shouldSkipFirebase()) {
    return () => window.removeEventListener(eventName(collection), syncLocal);
  }

  const unsubscribeFirebase = onValue(
    ref(database, collection),
    (snapshot) => {
      const firebaseRecords = snapshotToArray<T>(snapshot);
      const localRecords = readLocalCollection<T>(collection);
      const localOnlyRecords = localRecords.filter((record) => record.id.startsWith('local-'));

      onData([...firebaseRecords, ...localOnlyRecords]);
    },
    (error) => {
      markFirebaseBlocked();
      onFirebaseError?.(error);
      syncLocal();
    }
  );

  return () => {
    unsubscribeFirebase();
    window.removeEventListener(eventName(collection), syncLocal);
  };
}

export async function createAdminRecord<T extends RecordWithId>(
  collection: string,
  data: Partial<T> & Record<string, unknown>
): Promise<{ id: string; source: 'firebase' | 'local' }> {
  if (shouldSkipFirebase()) {
    const id = `local-${crypto.randomUUID()}`;
    const records = readLocalCollection<T>(collection);
    writeLocalCollection(collection, [...records, { ...data, id } as T & { id: string }]);
    return { id, source: 'local' };
  }

  try {
    const recordRef = await push(ref(database, collection), data);
    return { id: recordRef.key || crypto.randomUUID(), source: 'firebase' };
  } catch (error) {
    markFirebaseBlocked();
    const id = `local-${crypto.randomUUID()}`;
    const records = readLocalCollection<T>(collection);
    writeLocalCollection(collection, [...records, { ...data, id } as T & { id: string }]);
    return { id, source: 'local' };
  }
}

export async function updateAdminRecord<T extends RecordWithId>(
  collection: string,
  id: string,
  data: Partial<T> & Record<string, unknown>
): Promise<'firebase' | 'local'> {
  if (shouldSkipFirebase()) {
    const records = readLocalCollection<T>(collection);
    const nextRecords = records.map((record) =>
      record.id === id ? ({ ...record, ...data, id } as T & { id: string }) : record
    );
    writeLocalCollection(collection, nextRecords);
    return 'local';
  }

  try {
    await update(ref(database, `${collection}/${id}`), data);
    return 'firebase';
  } catch (error) {
    markFirebaseBlocked();
    const records = readLocalCollection<T>(collection);
    const nextRecords = records.map((record) =>
      record.id === id ? ({ ...record, ...data, id } as T & { id: string }) : record
    );

    if (!nextRecords.some((record) => record.id === id)) {
      nextRecords.push({ ...data, id } as T & { id: string });
    }

    writeLocalCollection(collection, nextRecords);
    return 'local';
  }
}

export async function deleteAdminRecord<T extends RecordWithId>(
  collection: string,
  id: string
): Promise<'firebase' | 'local'> {
  if (shouldSkipFirebase()) {
    const records = readLocalCollection<T>(collection);
    writeLocalCollection(
      collection,
      records.filter((record) => record.id !== id)
    );
    return 'local';
  }

  try {
    await remove(ref(database, `${collection}/${id}`));
    return 'firebase';
  } catch (error) {
    markFirebaseBlocked();
    const records = readLocalCollection<T>(collection);
    writeLocalCollection(
      collection,
      records.filter((record) => record.id !== id)
    );
    return 'local';
  }
}
