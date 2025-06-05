
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HealthMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
}

export const useHealthMetrics = (userId: string) => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = async (timeframe: string = '7d') => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

      // Apply timeframe filter
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '15d':
          startDate.setDate(now.getDate() - 15);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }
      
      query = query.gte('recorded_at', startDate.toISOString());

      const { data, error } = await query;
      
      if (error) throw error;
      setMetrics(data || []);
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Error loading health data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMetric = async (metricType: string, value: number, unit: string) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('user_metrics')
        .insert({
          user_id: userId,
          metric_type: metricType,
          value,
          unit,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Refresh metrics
      fetchMetrics();
      
      toast({
        title: "Metric added",
        description: `${metricType} value recorded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding metric",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getMetricsByType = (metricType: string) => {
    return metrics.filter(metric => metric.metric_type === metricType);
  };

  const getLatestMetric = (metricType: string) => {
    const typeMetrics = getMetricsByType(metricType);
    return typeMetrics.length > 0 ? typeMetrics[0] : null;
  };

  useEffect(() => {
    if (userId) {
      fetchMetrics();
    }
  }, [userId]);

  return {
    metrics,
    loading,
    fetchMetrics,
    addMetric,
    getMetricsByType,
    getLatestMetric
  };
};
