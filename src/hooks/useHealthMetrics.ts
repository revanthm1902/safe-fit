import { useState, useEffect, useCallback } from 'react';
import { supabase, type SensorData } from '@/integrations/supabase/client';

interface HealthMetrics {
  heartRate: number;
  spo2: number;
  temperature: number;
  stress: number;
  steps: number;
  timestamp: string;
  fromDb: boolean; // true if data originates from sensor_data table
}

interface HistoricalData {
  day: number;
  value: number;
  timestamp: string;
}

export const useHealthMetrics = () => {
  const [currentMetrics, setCurrentMetrics] = useState<HealthMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate stress from heart rate - memoized
  const calculateStress = useCallback((bpm: number | null): number => {
    if (!bpm) return 50;
    if (bpm < 60) return 20;
    if (bpm < 80) return 30;
    if (bpm < 100) return 50;
    if (bpm < 120) return 70;
    return 90;
  }, []);

  useEffect(() => {
    // Fetch latest sensor data (shared across all users for prototype)
    const fetchLatestData = async () => {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // No user logged in - show default values
          setCurrentMetrics({
            heartRate: 0,
            spo2: 0,
            temperature: 0,
            stress: 0,
            steps: 0,
            timestamp: new Date().toISOString(),
            fromDb: false,
          });
          setLoading(false);
          return;
        }

        // Get latest sensor data (no user_id filter - shared data)
        const { data, error } = await supabase
          .from('sensor_data')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        // No data found or error - show zeros instead of error
        if (error || !data) {
          setCurrentMetrics({
            heartRate: 0,
            spo2: 0,
            temperature: 0,
            stress: 0,
            steps: 0,
            timestamp: new Date().toISOString(),
            fromDb: false,
          });
          setError(null); // Clear any errors
          setLoading(false);
          return;
        }

        if (data) {
          setCurrentMetrics({
            heartRate: data.bpm || 0,
            spo2: data.spo2 || 0,
            temperature: 36.5 + Math.random() * 0.5, // Not in DB yet
            stress: calculateStress(data.bpm), // Calculate from heart rate
            steps: data.steps || 0,
            timestamp: data.timestamp,
            fromDb: true,
          });
        }
      } catch (err) {
        // On error, show zeros instead of error message
        setCurrentMetrics({
          heartRate: 0,
          spo2: 0,
          temperature: 0,
          stress: 0,
          steps: 0,
          timestamp: new Date().toISOString(),
          fromDb: false,
        });
        setError(null);
        console.warn('Could not fetch sensor data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('sensor_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sensor_data',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const data = payload.new as SensorData;
            setCurrentMetrics({
              heartRate: data.bpm || 0,
              spo2: data.spo2 || 0,
              temperature: 36.5 + Math.random() * 0.5,
              stress: calculateStress(data.bpm),
              steps: data.steps || 0,
              timestamp: data.timestamp,
              fromDb: true,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [calculateStress]);

  // Fetch historical data - use useCallback to memoize
  const fetchHistoricalData = useCallback(async (metric: string, days: number) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHistoricalData([]);
        return;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get historical data (no user_id filter - shared data)
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true });

      // No data or error - return empty array instead of error
      if (error || !data) {
        setHistoricalData([]);
        return;
      }

      const mappedData = data.map((item, index) => {
        let value = 0;
        switch (metric) {
          case 'heartRate':
            value = item.bpm || 0;
            break;
          case 'spo2':
            value = item.spo2 || 0;
            break;
          case 'temp':
            value = 36.5 + Math.random() * 0.5;
            break;
          case 'stress':
            value = calculateStress(item.bpm);
            break;
        }

        return {
          day: index + 1,
          value,
          timestamp: item.timestamp,
        };
      });

      setHistoricalData(mappedData);
    } catch (err) {
      console.warn('Error fetching historical data:', err);
      setHistoricalData([]);
    }
  }, [calculateStress]);

  return {
    currentMetrics,
    historicalData,
    loading,
    error,
    fetchHistoricalData,
  };
};