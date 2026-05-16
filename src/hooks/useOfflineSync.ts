import { useCallback, useEffect, useState } from 'react';
import type { Survey } from '../types';
import { upsertSurvey } from '../lib/db';
import { enqueueSurvey, flushQueue, getPendingCount } from '../lib/offlineQueue';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const goOnline = async () => {
      setIsOnline(true);
      await flushQueue();
      setPendingCount(await getPendingCount());
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    getPendingCount().then(setPendingCount);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const submitSurvey = useCallback(async (survey: Survey) => {
    if (navigator.onLine) {
      try {
        await upsertSurvey(survey);
        return;
      } catch {
        // Fall through to offline queue
      }
    }
    await enqueueSurvey(survey);
    setPendingCount((c) => c + 1);
  }, []);

  return { isOnline, pendingCount, submitSurvey };
}
