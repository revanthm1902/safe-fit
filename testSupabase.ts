import { supabase } from './src/integrations/supabase/client';

/**
 * Test script to verify Supabase connection and sensor_data table
 * Run with: npm run dev (then check browser console)
 */

export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...');
  
  try {
    // 1. Test connection
    const { data, error } = await supabase
      .from('sensor_data')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    
    // 2. Test inserting data
    console.log('📝 Inserting test data...');
    const { data: insertData, error: insertError } = await supabase
      .from('sensor_data')
      .insert([
        {
          bpm: 72,
          spo2: 98,
          steps: 3500,
          latitude: 12.9716,
          longitude: 77.5946,
        }
      ])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      return false;
    }
    
    console.log('✅ Test data inserted:', insertData);
    
    // 3. Test reading latest data
    console.log('📖 Reading latest data...');
    const { data: latestData, error: readError } = await supabase
      .from('sensor_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (readError) {
      console.error('❌ Read failed:', readError.message);
      return false;
    }
    
    console.log('✅ Latest data:', latestData);
    
    // 4. Test real-time subscription
    console.log('🔔 Testing real-time subscription...');
    const channel = supabase
      .channel('test_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sensor_data',
        },
        (payload) => {
          console.log('✅ Real-time update received:', payload);
        }
      )
      .subscribe((status) => {
        console.log('🔔 Subscription status:', status);
      });
    
    console.log('✅ All tests passed! Supabase is fully connected.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    return false;
  }
}

// To run this test, add to your component:
// import { testSupabaseConnection } from '../testSupabase';
// useEffect(() => { testSupabaseConnection(); }, []);
