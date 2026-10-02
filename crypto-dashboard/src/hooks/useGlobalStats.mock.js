import { useState, useEffect } from 'react';

export const useGlobalStats = () => {
    const [stats, setStats] = useState({
        volume: null,
        volumeChange: null,
        btcDominance: null,
        gasGwei: null,
    });

    useEffect(() => {
        const fetchGlobalData = async () => {
            try {
                // نستخدم Coinlore بدلاً من CoinGecko لتفادي حظر الطلبات
                const response = await fetch('https://api.coinlore.net/api/global/');
                const data = await response.json();

                const global = data[0]; // البيانات تأتي داخل مصفوفة

                setStats({
                    volume: global.total_volume,
                    volumeChange: parseFloat(global.mcap_change),
                    btcDominance: parseFloat(global.btc_d),
                    // يتم محاكاة الغاز برقم واقعي يتغير (واجهات الغاز المجانية نادرة جداً)
                    gasGwei: Math.floor(Math.random() * (25 - 12 + 1)) + 12,
                });
            } catch (error) {
                console.error("Error fetching global stats:", error);
            }
        };

        fetchGlobalData();
        const interval = setInterval(fetchGlobalData, 300000); // تحديث كل 5 دقائق
        return () => clearInterval(interval);
    }, []);

    return stats;
};

export const formatUsdCompact = (n) => {
    if (n == null) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(n);
};

export const formatGwei = (n) => {
    if (n == null) return '—';
    return n < 10 ? n.toFixed(2) : n.toFixed(0);
};