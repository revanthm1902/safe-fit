# 🚀 Quick Start Guide - Supabase Integration

## Your Supabase Credentials (Already Configured)

Located in: `.env`

```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
```

---

## Database Table Setup

Run this in your **Supabase SQL Editor** (if not already done):

```sql
-- 1. Create the sensor_data table
create table sensor_data (
    id bigint generated always as identity primary key,
    bpm int,
    spo2 float,
    steps int,
    latitude float,
    longitude float,
    timestamp timestamptz default now()
);

-- 2. Enable Row Level Security
alter table sensor_data enable row level security;

-- 3. Create policies for authenticated users
create policy "Allow authenticated read access"
  on sensor_data for select
  using (auth.role() = 'authenticated');

create policy "Allow authenticated insert access"
  on sensor_data for insert
  with check (auth.role() = 'authenticated');

-- 4. Add index for performance
create index idx_sensor_data_timestamp 
  on sensor_data(timestamp desc);
```

---

## Test the Integration

### Option 1: Insert Test Data via Supabase Dashboard

Go to: **Table Editor** → **sensor_data** → **Insert row**

```
bpm: 75
spo2: 98.5
steps: 5000
latitude: 12.9716
longitude: 77.5946
```

### Option 2: Insert via SQL

```sql
INSERT INTO sensor_data (bpm, spo2, steps, latitude, longitude)
VALUES (75, 98.5, 5000, 12.9716, 77.5946);
```

---

## What You Should See

After inserting data:

1. **Health Page** will show:
   - ❤️ Heart Rate: 75 BPM
   - 💧 SpO2: 98.5%
   - 📊 Stress Level: Calculated from BPM
   - 🌡️ Temperature: Simulated

2. **Dashboard** will show:
   - 👟 Steps: 5,000

3. Updates happen **instantly** (1-2 seconds via real-time subscription)

---

## File Changes Summary

### ✅ Updated Files:
1. `src/components/Health.tsx` - Fixed React Hook warning
2. `src/hooks/useHealthMetrics.ts` - Added useCallback memoization
3. `.env` - Already has Supabase credentials
4. `src/integrations/supabase/client.ts` - Already configured

### ✅ Already Working:
- Real-time data synchronization
- Historical data charts (7d, 15d, 30d)
- Step counter in Dashboard
- Error handling and loading states

---

## 📱 How Sensor Data Syncs

```
ESP32/Hardware Device
    ↓ (HTTP POST)
Supabase API (INSERT)
    ↓ (Real-time)
React App (Auto-update)
    ↓
Health & Dashboard Components
```

---

## Need to Add More Sensor Types?

To add temperature, humidity, etc. to the database:

```sql
-- Add new columns
ALTER TABLE sensor_data 
ADD COLUMN temperature float,
ADD COLUMN humidity float;
```

Then update `src/integrations/supabase/client.ts`:

```typescript
export interface SensorData {
  id: number;
  bpm: number | null;
  spo2: number | null;
  steps: number | null;
  temperature: number | null;  // NEW
  humidity: number | null;     // NEW
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}
```

---

## ✅ Status: READY TO USE!

Everything is set up and working. Just add your sensor data to the `sensor_data` table and watch it sync in real-time! 🎉
