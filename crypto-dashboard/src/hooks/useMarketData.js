import { useState, useEffect } from 'react';

const POINTS = 30;

export const useMarketData = () => {
  const [data, setData] = useState({
    bitcoin: { price: 0, change: 0, low: 0, high: 0, sparkline: Array(POINTS).fill(0) },
    ethereum: { price: 0, change: 0, low: 0, high: 0, sparkline: Array(POINTS).fill(0) },
    solana: { price: 0, change: 0, low: 0, high: 0, sparkline: Array(POINTS).fill(0) },
  });

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/solusdt@ticker');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const symbol = message.s;
      const currentPrice = parseFloat(message.c);
      const changePercent = parseFloat(message.P);
      const high = parseFloat(message.h);
      const low = parseFloat(message.l);

      setData((prev) => {
        let coinKey = '';
        if (symbol === 'BTCUSDT') coinKey = 'bitcoin';
        else if (symbol === 'ETHUSDT') coinKey = 'ethereum';
        else if (symbol === 'SOLUSDT') coinKey = 'solana';

        if (!coinKey) return prev;

        const prevCoin = prev[coinKey];
        const isInitial = prevCoin.sparkline[0] === 0;
        const newSparkline = isInitial
            ? Array(POINTS).fill(currentPrice)
            : [...prevCoin.sparkline.slice(1), currentPrice];

        return {
          ...prev,
          [coinKey]: {
            price: currentPrice,
            change: changePercent,
            high: high,
            low: low,
            sparkline: newSparkline,
          },
        };
      });
    };

    return () => ws.close();
  }, []);

  return data;
};