import { openDB, type IDBPDatabase } from 'idb';
import type { Survey, QueuedSurvey } from '../types';
import { upsertSurvey } from './db';

const DB_NAME = 'aquatrack-offline';
const STORE = 'pending-surveys';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function enqueueSurvey(survey: Survey): Promise<void> {
  const db = await getDb();
  const item: QueuedSurvey = { id: survey.id, payload: survey, timestamp: Date.now() };
  await db.put(STORE, item);
}

export async function flushQueue(): Promise<number> {
  const db = await getDb();
  const all = await db.getAll(STORE) as QueuedSurvey[];
  let synced = 0;
  for (const item of all) {
    try {
      await upsertSurvey(item.payload);
      await db.delete(STORE, item.id);
      synced++;
    } catch {
      break;
    }
  }
  return synced;
}

export async function getPendingCount(): Promise<number> {
  const db = await getDb();
  return db.count(STORE);
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { flushQueue(); });
}
