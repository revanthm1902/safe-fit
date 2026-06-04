# 🚀 Quick Start Guide - Supabase Integration

## Your Supabase Credentials


```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
```

---

## Database Table Setup


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
  temperature: number | null; 
  humidity: number | null;  
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}
```

---

## ✅ Status: READY TO USE!

