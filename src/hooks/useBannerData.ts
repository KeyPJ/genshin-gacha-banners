import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { gachaData } from 'genshin-wishes';

export function useBannerData(gameKey: string, itemType: string) {
    const [data, setData] = useState<gachaData[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = `/data/${gameKey}/${itemType.toLowerCase()}.json`;
            const response = await axios.get(endpoint);
            const resData = response.data as gachaData[];
            const filteredData = resData
                .filter(item => item.start < new Date().toISOString())
                .reverse();
            setData(filteredData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    }, [gameKey, itemType]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return { data, loading, refetch: loadData };
}
