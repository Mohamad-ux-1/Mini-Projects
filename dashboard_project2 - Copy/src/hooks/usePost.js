import { useState } from 'react';

const usePost = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const executePost = async (bodyData) => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify(bodyData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'حدث خطأ ما');
            }

            setData(result);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { executePost, data, loading, error };
};

export default usePost;
