import {useState, useEffect} from 'react';

export default function useFetch(url, method) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                console.log(result);
                setData(result);
                
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [url]);

    return {data, loading, error};
}
