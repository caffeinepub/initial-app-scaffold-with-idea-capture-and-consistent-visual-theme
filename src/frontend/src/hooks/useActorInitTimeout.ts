import { useEffect, useState } from 'react';
import { useActor } from './useActor';

const ACTOR_INIT_TIMEOUT_MS = 15000; // 15 seconds

/**
 * Hook that detects if actor initialization is taking too long.
 * Returns true if actor has been fetching for longer than the timeout period.
 */
export function useActorInitTimeout(): boolean {
  const { isFetching } = useActor();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isFetching) {
      setHasTimedOut(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (isFetching) {
        setHasTimedOut(true);
      }
    }, ACTOR_INIT_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [isFetching]);

  return hasTimedOut;
}
