import { useEffect, useState } from 'react';

/** Current time, refreshed on an interval so "in progress" and progress bars stay correct. */
export default function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
