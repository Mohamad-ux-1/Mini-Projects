import { useCallback, useEffect, useState } from 'react';
import { WATCHLIST } from './useWatchlistData';

const KEY = 'watchlist:v1';

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) { /* ignore corrupted storage */ }
  return WATCHLIST.map((c) => ({ ...c, favorite: false, alertOn: true }));
};

// Your editable watchlist (targets, holdings, favorites, alerts), persisted in localStorage.
export default function useWatchlistConfig() {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* storage unavailable */ }
  }, [items]);

  const update = useCallback((id, patch) => setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i))), []);
  const toggle = useCallback((id, field) => setItems((p) => p.map((i) => (i.id === id ? { ...i, [field]: !i[field] } : i))), []);
  const remove = useCallback((id) => setItems((p) => p.filter((i) => i.id !== id)), []);
  const add = useCallback(
    (item) => setItems((p) => (p.some((i) => i.id === item.id) ? p : [...p, { favorite: false, alertOn: true, ...item }])),
    []
  );

  return { items, update, toggle, remove, add };
}
