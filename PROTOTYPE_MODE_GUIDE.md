# 🎯 Prototype Mode: Shared Sensor Data

## What Changed

Your app now works in **Prototype Mode** where:
- ✅ User authentication is still required (login/signup)
- ✅ Each user has their own profile and preferences
- ✅ **Sensor data is SHARED across all users** (no user_id)
- ✅ Perfect for demo with single IoT device

---

## Quick Setup

### Step 1: Run This SQL in Supabase

```sql
-- Remove user_id and recreate sensor_data table
DROP TABLE IF EXISTS sensor_data CASCADE;

CREATE TABLE sensor_data (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bpm INT,
    spo2 FLOAT,
    steps INT,
    latitude FLOAT,
    longitude FLOAT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to access
CREATE POLICY "All authenticated users can read"
    ON sensor_data FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert"
    ON sensor_data FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Add index
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data;
```

### Step 2: Insert Test Data

```sql
INSERT INTO sensor_data (bpm, spo2, steps)
VALUES (75, 98.5, 5000);
```

### Step 3: Test in App

1. Sign in as any user
2. Go to Health page
3. All users will see: **Heart Rate: 75 BPM, SpO2: 98.5%, Steps: 5000**

---

## How It Works Now

### User A logs in:
```
- Email: usera@example.com
- Sees: Heart Rate 75 BPM, Steps 5000
```

### User B logs in:
```
- Email: userb@example.com  
- Sees: Heart Rate 75 BPM, Steps 5000 (SAME DATA)
```

### IoT Device Updates:
```sql
UPDATE sensor_data 
SET bpm = 80, steps = 6000
WHERE id = (SELECT id FROM sensor_data ORDER BY timestamp DESC LIMIT 1);
```

### Both Users See:
```
- Heart Rate: 80 BPM ✅
- Steps: 6000 ✅
- Updates in real-time (1-2 seconds)
```

---

## Files Updated

1. ✅ `src/integrations/supabase/client.ts` - Removed user_id from SensorData type
2. ✅ `src/hooks/useHealthMetrics.ts` - Removed user_id filtering
3. ✅ `SHARED_SENSOR_DATA_SETUP.md` - New setup guide
4. ✅ `SUPABASE_AUTH_SETUP.md` - Updated schema
5. ✅ `AUTH_IMPLEMENTATION_GUIDE.md` - Updated examples

---

## IoT Device Integration (ESP32/Arduino)

### Simple POST Request (No User ID Needed)

```cpp
// ESP32 Example
#include <WiFi.h>
#include <HTTPClient.h>

void sendSensorData(int bpm, float spo2, int steps) {
    HTTPClient http;
    
    http.begin("https://ntwqxgzcmwvvrptctetx.supabase.co/rest/v1/sensor_data");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", "YOUR_SUPABASE_ANON_KEY");
    http.addHeader("Prefer", "return=minimal");
    
    String payload = "{\"bpm\":" + String(bpm) + 
                     ",\"spo2\":" + String(spo2) + 
                     ",\"steps\":" + String(steps) + "}";
    
    int httpCode = http.POST(payload);
    http.end();
}

// Usage
sendSensorData(75, 98.5, 5000);
```

---

## Benefits for Prototype

✅ **Simpler IoT Integration** - No need to track which user owns the device
✅ **Easy Demo** - Same data for all demo accounts
✅ **Real-time for All** - When device updates, everyone sees it
✅ **Still Secure** - Users must log in to see data
✅ **Easy to Migrate** - Can add user_id later for production

---

## Migration to Production (Later)

When you want user-specific data:

```sql
-- Add user_id column
ALTER TABLE sensor_data ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update policies
DROP POLICY "All authenticated users can read" ON sensor_data;

CREATE POLICY "Users see own data"
    ON sensor_data FOR SELECT
    USING (auth.uid() = user_id);
```

---

## ✅ You're Ready!

Just run the SQL above and your app will:
- ✅ Require user login
- ✅ Show shared sensor data to all users
- ✅ Update in real-time
- ✅ Work perfectly for prototype demos

🚀 **Perfect for your prototype round!**
