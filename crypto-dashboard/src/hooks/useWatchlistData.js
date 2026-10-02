import { useEffect, useMemo, useRef, useState } from 'react';

// Your own inputs: targets and holdings (qty) are yours to edit; everything else is live.
export const WATCHLIST = [
  { id: 'btc',  name: 'Bitcoin',       symbol: 'BTC',  pair: 'BTCUSDT',  category: 'Layer 1',      target: 70000, qty: 0.5 },
  { id: 'eth',  name: 'Ethereum',      symbol: 'ETH',  pair: 'ETHUSDT',  category: 'Layer 1',      target: 3800,  qty: 5 },
  { id: 'sol',  name: 'Solana',        symbol: 'SOL',  pair: 'SOLUSDT',  category: 'Layer 1',      target: 165,   qty: 50 },
  { id: 'link', name: 'Chainlink',     symbol: 'LINK', pair: 'LINKUSDT', category: 'DeFi / Infra', target: 22,    qty: 300 },
  { id: 'avax', name: 'Avalanche',     symbol: 'AVAX', pair: 'AVAXUSDT', category: 'Layer 1',      target: 35,    qty: 100 },
  { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR', pair: 'NEARUSDT', category: 'Layer 1',      target: 6.5,   qty: 400 },
  { id: 'pol',  name: 'Polygon',       symbol: 'POL',  pair: 'POLUSDT',  category: 'DeFi / Infra', target: 0.6,   qty: 5000 },
  { id: 'sui',  name: 'Sui Network',   symbol: 'SUI',  pair: 'SUIUSDT',  category: 'Layer 1',      target: 2.1,   qty: 800 },
];

// Coins the "Add asset" dialog can offer (all are Binance <SYMBOL>USDT pairs).
const mk = (symbol, name, category) => ({ id: symbol.toLowerCase(), symbol, name, category, pair: `${symbol}USDT` });
export const CATALOG = [
  mk('BTC', 'Bitcoin', 'Layer 1'), mk('ETH', 'Ethereum', 'Layer 1'), mk('SOL', 'Solana', 'Layer 1'),
  mk('BNB', 'BNB', 'Layer 1'), mk('XRP', 'XRP', 'Payments'), mk('ADA', 'Cardano', 'Layer 1'),
  mk('AVAX', 'Avalanche', 'Layer 1'), mk('DOT', 'Polkadot', 'Layer 1'), mk('NEAR', 'NEAR Protocol', 'Layer 1'),
  mk('SUI', 'Sui Network', 'Layer 1'), mk('APT', 'Aptos', 'Layer 1'), mk('ATOM', 'Cosmos', 'Layer 1'),
  mk('TON', 'Toncoin', 'Layer 1'), mk('TRX', 'TRON', 'Layer 1'), mk('LTC', 'Litecoin', 'Payments'),
  mk('LINK', 'Chainlink', 'DeFi / Infra'), mk('UNI', 'Uniswap', 'DeFi / Infra'), mk('AAVE', 'Aave', 'DeFi / Infra'),
  mk('POL', 'Polygon', 'DeFi / Infra'), mk('ARB', 'Arbitrum', 'DeFi / Infra'), mk('OP', 'Optimism', 'DeFi / Infra'),
  mk('DOGE', 'Dogecoin', 'Meme / Speculative'), mk('SHIB', 'Shiba Inu', 'Meme / Speculative'),
];

const REST = 'https://api.binance.com/api/v3';
const wsUrl = (pairs) =>
  'wss://stream.binance.com:9443/stream?streams=' + pairs.map((p) => `${p.toLowerCase()}@ticker`).join('/');

export const formatCompact = (n) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n);

export default function useWatchlistData(items = WATCHLIST) {
  const [ticks, setTicks] = useState({});     // pair -> live 24h ticker
  const [history, setHistory] = useState({}); // pair -> [{value}] (7 days, 4h candles)
  const [status, setStatus] = useState('connecting');
  const fetched = useRef(new Set());
  const pairsKey = items.map((c) => c.pair).join(',');

  // 7-day history for sparklines: fetched once per pair (also for newly added assets)
  useEffect(() => {
    const todo = pairsKey ? pairsKey.split(',').filter((p) => !fetched.current.has(p)) : [];
    todo.forEach((p) => fetched.current.add(p));
    Promise.allSettled(
      todo.map(async (pair) => {
        const res = await fetch(`${REST}/klines?symbol=${pair}&interval=4h&limit=42`);
        if (!res.ok) throw new Error(`${pair}: ${res.status}`);
        const k = await res.json();
        return [pair, k.map((x) => ({ value: parseFloat(x[4]) }))];
      })
    ).then((results) => {
      const ok = [];
      results.forEach((r, i) => (r.status === 'fulfilled' ? ok.push(r.value) : fetched.current.delete(todo[i])));
      if (ok.length) setHistory((prev) => ({ ...prev, ...Object.fromEntries(ok) }));
    });
  }, [pairsKey]);

  // Live ticker stream (pushes ~every 1s per symbol); reconnects when the asset list changes or the socket drops
  useEffect(() => {
    if (!pairsKey) return undefined;
    let ws;
    let timer;
    let retry = 0;
    let closed = false;
    setStatus('connecting');

    const connect = () => {
      ws = new WebSocket(wsUrl(pairsKey.split(',')));
      ws.onopen = () => { retry = 0; setStatus('live'); };
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data).data;
        if (!d) return;
        setTicks((prev) => ({
          ...prev,
          [d.s]: {
            price: parseFloat(d.c),
            change: parseFloat(d.P),
            open: parseFloat(d.o),
            high: parseFloat(d.h),
            low: parseFloat(d.l),
            volume: parseFloat(d.q), // 24h volume in USDT
          },
        }));
      };
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        if (closed) return;
        setStatus('reconnecting');
        timer = setTimeout(connect, Math.min(1000 * 2 ** retry++, 15000));
      };
    };

    connect();
    return () => { closed = true; clearTimeout(timer); ws && ws.close(); };
  }, [pairsKey]);

  const rows = useMemo(
    () =>
      items.map((c) => {
        const t = ticks[c.pair];
        const price = t ? t.price : null;
        const hist = history[c.pair] || [];
        const sparkline = price && hist.length ? [...hist.slice(0, -1), { value: price }] : hist;
        const change = t ? t.change : null;
        return {
          ...c,
          loaded: !!t,
          price,
          change,
          open: t ? t.open : null,
          high: t ? t.high : null,
          low: t ? t.low : null,
          volume: t ? t.volume : null,
          positive: (change ?? 0) >= 0,
          distValue: price ? c.target - price : 0,
          distPct: price ? Math.min(100, Math.max(0, (price / c.target) * 100)) : 0,
          sparkline,
        };
      }),
    [items, ticks, history]
  );

  const summary = useMemo(() => {
    const live = rows.filter((r) => r.loaded);
    if (!live.length) {
      return { value: null, changePct: null, low: null, high: null, topGainer: null, triggered: [], near: [] };
    }
    const sum = (f) => live.reduce((a, r) => a + f(r), 0);
    const value = sum((r) => r.qty * r.price);
    const openValue = sum((r) => r.qty * r.open);
    return {
      value,
      changePct: openValue ? ((value - openValue) / openValue) * 100 : 0,
      low: sum((r) => r.qty * r.low),   // sum of per-asset lows (not simultaneous)
      high: sum((r) => r.qty * r.high),
      topGainer: live.reduce((b, r) => (r.change > b.change ? r : b)),
      triggered: live.filter((r) => r.price >= r.target),
      near: live.filter((r) => r.price < r.target && r.distPct >= 95),
    };
  }, [rows]);

  return { rows, summary, status };
}
