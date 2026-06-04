# Shared Sensor Data Setup (Prototype Mode)

## SQL Schema for Shared Sensor Data

Run this in your **Supabase SQL Editor** to set up shared sensor data for all users:

```sql
-- 1. Remove user_id column from sensor_data (if it exists)
ALTER TABLE sensor_data DROP COLUMN IF EXISTS user_id;

-- 2. Recreate sensor_data table without user_id
DROP TABLE IF EXISTS sensor_data;

CREATE TABLE sensor_data (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bpm INT,
    spo2 FLOAT,
    steps INT,
    latitude FLOAT,
    longitude FLOAT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

-- 4. Allow ALL authenticated users to read sensor data (shared)
CREATE POLICY "Allow all authenticated users to read sensor data"
    ON sensor_data
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 5. Allow ALL authenticated users to insert sensor data
CREATE POLICY "Allow all authenticated users to insert sensor data"
    ON sensor_data
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- 6. Allow ALL authenticated users to update sensor data
CREATE POLICY "Allow all authenticated users to update sensor data"
    ON sensor_data
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- 7. Add index for better performance
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp DESC);

-- 8. Enable realtime for sensor_data
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data;
```

---

## Insert Sample Data (For Testing)

```sql
-- Insert some sample sensor data
INSERT INTO sensor_data (bpm, spo2, steps, latitude, longitude)
VALUES 
    (75, 98.5, 5000, 12.9716, 77.5946),
    (78, 97.8, 5500, 12.9720, 77.5950),
    (72, 98.2, 6000, 12.9725, 77.5955);

-- Verify data
SELECT * FROM sensor_data ORDER BY timestamp DESC;
```

---

## What This Does

✅ **Removes user-specific data filtering**
- All users see the same sensor data
- No `user_id` column needed
- Perfect for prototype/demo with shared IoT device

✅ **Still requires authentication**
- Users must be logged in to see data
- Data is not public

✅ **Real-time updates**
- When IoT device updates sensor data, all users see it instantly

---

## For IoT Device Integration

Your IoT device can now insert data without user_id:

```javascript
// Example: ESP32/Arduino POST request
const sensorData = {
  bpm: 75,
  spo2: 98.5,
  steps: 5000,
  latitude: 12.9716,
  longitude: 77.5946
};

// POST to Supabase REST API
fetch('https://ntwqxgzcmwvvrptctetx.supabase.co/rest/v1/sensor_data', {
  method: 'POST',
  headers: {
    'apikey': 'YOUR_SUPABASE_ANON_KEY',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify(sensorData)
});
```

---

## Migration Note

If you already have data in `sensor_data` with `user_id`, the DROP TABLE will delete it.
To preserve existing data:

```sql
-- Backup existing data first
CREATE TABLE sensor_data_backup AS SELECT * FROM sensor_data;


-- Restore data without user_id
INSERT INTO sensor_data (bpm, spo2, steps, latitude, longitude, timestamp)
SELECT bpm, spo2, steps, latitude, longitude, timestamp 
FROM sensor_data_backup;
```

