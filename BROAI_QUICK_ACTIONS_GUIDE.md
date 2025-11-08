# BroAI Quick Actions & Permissions Guide

## Overview
Enhanced BroAI with quick action buttons for instant health and fitness checks, plus proper Capacitor permissions handling for camera and microphone access.

**🎯 Key Feature:** Quick action buttons now fetch **live sensor data from Supabase** and provide AI-powered analysis with real-time insights and precautions!

## New Features

### ✅ Quick Action Buttons with Live Data Analysis

Two prominent action buttons that fetch **real-time sensor data** and provide intelligent analysis:

#### 1. **Check My Health** 
- **Color:** Red to Pink gradient
- **Icon:** Heart icon
- **Action:** Fetches live health data from Supabase sensor_data table
- **Data Analyzed:**
  - Current Heart Rate (BPM)
  - Blood Oxygen Level (SpO2)
  - Body Temperature
  - Stress Level (calculated from heart rate)
  - 7-Day Averages for trends
- **AI Response:** Comprehensive health assessment with:
  - Overall health status
  - Concerning patterns or abnormal values
  - **Specific precautions and warnings** if needed
  - Personalized recommendations

#### 2. **Check My Fitness**
- **Color:** Green to Teal gradient  
- **Icon:** Activity icon
- **Action:** Fetches live fitness data from Supabase sensor_data table
- **Data Analyzed:**
  - Steps taken today
  - Calories burned
  - Distance traveled
  - Active heart rate
  - 7-Day activity summary and trends
- **AI Response:** Detailed fitness progress report with:
  - Activity level evaluation (sedentary to very active)
  - Progress toward 10,000 step goal
  - **Specific recommendations** to improve performance
  - Motivation based on actual data

### ✅ Capacitor Permissions Handling

Proper permission request system for camera and microphone access:

#### Web Browser
- Uses standard `navigator.mediaDevices.getUserMedia()` API
- Requests permissions on first use
- Gracefully handles permission denial

#### Mobile (Capacitor)
- Ready for Capacitor Camera and Microphone plugins
- Permissions requested on app load
- Fallback to on-demand requests

## Implementation Details

### Quick Action Buttons

**Location:** `src/components/BroAI.tsx`

**UI Placement:** Top of input area, above text field

```tsx
<div className="flex gap-2 mb-3">
  <Button
    onClick={() => handleQuickAction('health')}
    disabled={loading}
    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500..."
  >
    <Heart className="h-4 w-4 mr-2" />
    Check My Health
  </Button>
  <Button
    onClick={() => handleQuickAction('fitness')}
    disabled={loading}
    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500..."
  >
    <Activity className="h-4 w-4 mr-2" />
    Check My Fitness
  </Button>
</div>
```

### Quick Action Handler

```typescript
const handleQuickAction = async (actionType: 'health' | 'fitness') => {
  setLoading(true);
  
  try {
    // 1. Verify user authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    // 2. Fetch latest sensor data from Supabase
    const { data: sensorData, error: sensorError } = await supabase
      .from('sensor_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // 3. Get historical data for trend analysis (last 7 entries)
    const { data: historicalData } = await supabase
      .from('sensor_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(7);

    // 4. Build detailed context with real data
    if (actionType === 'health') {
      // Calculate 7-day averages
      const avgBpm = historicalData?.reduce((sum, d) => sum + (d.bpm || 0), 0) / historicalData?.length;
      const avgSpo2 = historicalData?.reduce((sum, d) => sum + (d.spo2 || 0), 0) / historicalData?.length;
      
      dataContext = `
Current Health Data (Live):
- Heart Rate (BPM): ${sensorData.bpm} bpm
- Blood Oxygen (SpO2): ${sensorData.spo2}%
- Temperature: ${temperature}°C
- Stress Level: ${stressLevel}
- Timestamp: ${timestamp}

7-Day Averages:
- Average Heart Rate: ${avgBpm.toFixed(1)} bpm
- Average SpO2: ${avgSpo2.toFixed(1)}%

Please analyze this data and provide:
1. Overall health assessment
2. Any concerning patterns or values
3. Specific precautions or warnings if needed
4. Recommendations for improvement
`;
    }

    // 5. Send to Gemini AI with context
    const response = await generateWellnessResponse(message, dataContext);
    
    // 6. Display AI response with insights and precautions
    setMessages(prev => [...prev, aiMessage]);
    
    // 7. Speak response if sound enabled
    if (soundEnabled) speakText(response);
    
  } catch (error) {
    // Handle errors gracefully
  }
};
```

### Permissions System

**Utility File:** `src/lib/permissions.ts`

**Functions:**
- `requestCameraPermission()` - Request camera access
- `requestMicrophonePermission()` - Request microphone access
- `requestAllPermissions()` - Request both permissions

**Implementation:**
```typescript
useEffect(() => {
  const initializePermissions = async () => {
    const permissions = await requestAllPermissions();
    console.log('Permissions initialized:', permissions);
  };

  initializePermissions();
}, []);
```

### Permission Request Flow

```
App Loads
    ↓
useEffect Hook Runs
    ↓
requestAllPermissions() Called
    ↓
Request Camera Permission
    ↓
Request Microphone Permission
    ↓
Log Results to Console
    ↓
Continue Normal Operation
```

## User Experience

### Quick Actions Workflow

1. **User opens BroAI**
2. **Sees two prominent buttons:**
   - 🩺 Check My Health (red/pink)
   - 💪 Check My Fitness (green/teal)
3. **Taps "Check My Health"**
4. **System automatically:**
   - ✅ Fetches latest sensor data from Supabase (BPM, SpO2, steps, etc.)
   - ✅ Retrieves 7-day historical data for trend analysis
   - ✅ Calculates averages and metrics (stress level, calories, distance)
   - ✅ Builds comprehensive data context with timestamps
   - ✅ Sends query + real data to Gemini AI
   - ✅ Shows loading indicator
   - ✅ Displays AI response with insights and precautions
   - ✅ Speaks response if sound enabled
5. **User sees detailed analysis:**
   - "Your heart rate of 95 bpm is slightly elevated compared to your 7-day average of 78 bpm..."
   - "⚠️ **Precaution:** Consider taking a 5-minute breathing exercise to lower stress..."
   - "Your SpO2 of 98% is excellent, indicating healthy oxygen levels..."
   - "Recommendation: Monitor your heart rate today and avoid strenuous activity..."

### Permissions Workflow

#### First Time User:
```
Opens BroAI
    ↓
Browser/App Requests Camera Permission
    ↓
User Grants/Denies
    ↓
Browser/App Requests Microphone Permission
    ↓
User Grants/Denies
    ↓
Permissions Status Logged
    ↓
User Can Use Camera/Mic Features
```

#### Subsequent Uses:
```
Opens BroAI
    ↓
Permissions Already Granted
    ↓
No Additional Prompts
    ↓
Features Work Immediately
```

## Visual Design

### Quick Action Buttons

**Health Button:**
- Background: `bg-gradient-to-r from-red-500 to-pink-500`
- Hover: `hover:from-red-600 hover:to-pink-600`
- Icon: Heart (lucide-react)
- Text: White
- Shape: Rounded full
- Flex: flex-1 (50% width each)

**Fitness Button:**
- Background: `bg-gradient-to-r from-green-500 to-teal-500`
- Hover: `hover:from-green-600 hover:to-teal-600`
- Icon: Activity (lucide-react)
- Text: White
- Shape: Rounded full
- Flex: flex-1 (50% width each)

**Layout:**
```
┌─────────────────────────────────────┐
│  🩺 Check My Health │ 💪 Check My Fitness  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Type your message...          [>]  │
└─────────────────────────────────────┘
│  🎤  📷  🖼️  🎵  🎥               │
```

## Code Structure

### Files Modified/Created

1. **`src/components/BroAI.tsx`**
   - Added quick action buttons
   - Added permission request on mount
   - Added handleQuickAction function
   - Imported Heart and Activity icons

2. **`src/lib/permissions.ts`** (NEW)
   - Camera permission request
   - Microphone permission request
   - Combined permission request
   - Capacitor-ready structure

### Dependencies

No new npm packages required for web version!

For mobile (optional):
```bash
npm install @capacitor/camera
npm install @capacitor/microphone
```

## Browser Compatibility

### Camera & Microphone API Support
- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 12+
- ✅ Mobile browsers (with HTTPS)

### Speech Recognition Support
- ✅ Chrome 33+
- ✅ Edge 79+
- ⚠️ Firefox (limited support)
- ⚠️ Safari (limited support)

## Testing

### Test Quick Actions with Live Data

1. **Health Check with Real Sensor Data:**
   ```
   - Ensure sensor_data table has recent entries in Supabase
   - Open BroAI
   - Click "Check My Health"
   - Verify it displays: "🩺 Check My Health" in chat
   - Wait for AI response (should include actual BPM, SpO2 values)
   - Check response mentions specific numbers from your data
   - Verify precautions if BPM > 100 or SpO2 < 95
   - Confirm 7-day averages are mentioned
   ```

2. **Fitness Check with Real Activity Data:**
   ```
   - Ensure sensor_data has steps recorded
   - Open BroAI
   - Click "Check My Fitness"
   - Verify it displays: "💪 Check My Fitness" in chat
   - Wait for AI response (should include actual steps, calories, distance)
   - Check response evaluates activity level accurately
   - Verify goal progress calculation (X% of 10,000 steps)
   - Confirm recommendations are specific to your data
   ```

3. **No Data Scenario:**
   ```
   - Clear sensor_data table (or test with new user)
   - Click health/fitness button
   - Verify graceful error: "I couldn't find any sensor data right now..."
   - Confirm app doesn't crash
   ```

4. **Not Logged In:**
   ```
   - Log out of app
   - Open BroAI
   - Click quick action button
   - Verify message: "Please log in to access your health and fitness data! 🔐"
   ```

### Test Permissions

1. **Camera Permission:**
   ```
   - Open BroAI first time
   - Browser prompts for camera
   - Grant permission
   - Click camera button
   - Verify camera activates
   ```

2. **Microphone Permission:**
   ```
   - Open BroAI first time
   - Browser prompts for microphone
   - Grant permission
   - Click mic button
   - Verify mic activates
   ```

3. **Permission Denial:**
   ```
   - Deny camera/mic permissions
   - Try to use features
   - Verify graceful error handling
   - Check error messages display
   ```

## Error Handling

### Camera Access Denied
```typescript
catch (err) {
  console.error("Error accessing camera:", err);
  speakText("I couldn't access your camera. Please check your permissions!");
}
```

### Microphone Access Denied
```typescript
catch (err) {
  console.error("Error accessing microphone:", err);
  speakText("I couldn't access your microphone. Please check your permissions!");
}
```

### Quick Action Failures
```typescript
catch (error) {
  console.error('Error generating response:', error);
  const fallbackMessage = {
    text: "I'd love to check your health! Please ensure your health data is synced.",
    isUser: false,
    timestamp: new Date()
  };
  setMessages(prev => [...prev, fallbackMessage]);
}
```

## Capacitor Mobile Implementation

### Android Manifest
Ensure permissions are declared in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### iOS Info.plist
Add permission descriptions:

```xml
<key>NSCameraUsageDescription</key>
<string>BroAI needs camera access for image analysis</string>
<key>NSMicrophoneUsageDescription</key>
<string>BroAI needs microphone access for voice commands</string>
```

### Capacitor Plugin Integration (Optional)

For advanced mobile features:

```typescript
import { Camera } from '@capacitor/camera';

export const requestCapacitorPermissions = async () => {
  try {
    const cameraPermission = await Camera.checkPermissions();
    if (cameraPermission.camera !== 'granted') {
      await Camera.requestPermissions();
    }
    return true;
  } catch (error) {
    console.error('Capacitor permission error:', error);
    return false;
  }
};
```

## Future Enhancements

### Potential Features
1. **More Quick Actions:**
   - Check Sleep Quality
   - Analyze Nutrition
   - Mental Health Check
   - Safety Status

2. **Customizable Quick Actions:**
   - User-defined shortcuts
   - Favorite queries
   - Recent checks

3. **Voice-Activated Quick Actions:**
   - "Hey BroAI, check my health"
   - "Hey BroAI, fitness report"

4. **Scheduled Checks:**
   - Daily health summary
   - Weekly fitness review
   - Monthly wellness report

## Example AI Responses

### Health Check Example (with Real Data)

**User Data:**
- BPM: 95, SpO2: 98%, Steps: 3,245
- 7-day avg BPM: 78, avg SpO2: 97%

**AI Response:**
```
Hey! Let me check your health stats 🩺

📊 Current Status:
Your heart rate is at 95 bpm, which is notably higher than your 7-day average of 78 bpm. This could indicate:
- Recent physical activity
- Elevated stress levels
- Caffeine consumption

Your SpO2 of 98% is excellent! This indicates healthy oxygen saturation in your blood. 👍

⚠️ PRECAUTIONS:
Since your heart rate is elevated:
1. Take a 5-minute break and practice deep breathing
2. Avoid strenuous exercise for the next hour
3. Stay hydrated
4. Monitor if your heart rate doesn't decrease within 30 minutes

🎯 Recommendations:
- Try a short meditation session to lower stress
- Check your caffeine intake today
- If elevated heart rate persists, consult a healthcare professional

Overall Assessment: Generally healthy with temporary elevated heart rate. Nothing concerning, but worth monitoring! 💪
```

### Fitness Check Example (with Real Data)

**User Data:**
- Steps: 8,432, Calories: 337 kcal, Distance: 6.75 km
- 7-day total: 52,340 steps, avg: 7,477 steps/day

**AI Response:**
```
Let's analyze your fitness progress! 💪

📈 Today's Activity:
Great work! You've logged 8,432 steps today, burning 337 calories and covering 6.75 km. You're at 84.3% of the recommended 10,000 daily step goal!

📊 7-Day Performance:
Your weekly average is 7,477 steps/day, which classifies you as "Moderately Active" 🏃‍♂️

Total weekly steps: 52,340 (that's impressive!)

🎯 Activity Level: MODERATELY ACTIVE
You're doing better than most! Keep up the momentum.

💡 Recommendations to Reach 10,000 Steps:
1. Add a 15-minute evening walk (≈1,500 steps)
2. Take stairs instead of elevator when possible
3. Walk during phone calls
4. Park farther from destinations

🔥 Motivation:
You're only 1,568 steps away from your goal today! That's just a 12-minute walk. You got this! Push through and make today a 10K day! 

Keep crushing it, bro! 💯
```

## Troubleshooting

### Quick Action Issues

#### Buttons Not Appearing
**Issue:** Quick action buttons not visible
**Solution:** Clear cache, reload app, check BroAI.tsx updated

#### No Data / Generic Responses
**Issue:** AI gives generic responses without specific numbers from your data
**Solution:** 
- Check Supabase connection is working
- Verify sensor_data table has recent entries
- Check browser console for API errors
- Ensure user is logged in
- Test Supabase query manually: `SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1;`

#### "Couldn't find sensor data" Error
**Issue:** Quick action says no data available
**Solution:**
- Add test data to sensor_data table
- Check if timestamp is recent (within 24 hours)
- Verify Supabase credentials in .env file
- Ensure RLS policies allow read access

#### AI Not Providing Precautions
**Issue:** Response doesn't include warnings or precautions
**Solution:**
- Check if health values are within normal range (BPM: 60-100, SpO2: 95-100)
- Try with abnormal test data (BPM: 120, SpO2: 92) to trigger warnings
- Verify data context is being sent to AI (check console logs)

#### "Please log in" Message
**Issue:** Quick actions require login
**Solution:** This is expected - authenticate via AuthScreen first

### Permission Issues

#### Permissions Not Requested
**Issue:** No permission prompts
**Solution:** 
- Check HTTPS (required for camera/mic)
- Verify browser compatibility
- Check console for errors

#### AI Not Responding to Quick Actions
**Issue:** Button click but no response
**Solution:**
- Check Gemini API key configured
- Verify internet connection
- Check browser console for errors

---

**Last Updated:** November 8, 2025
**Version:** 2.0 - Live Data Integration
**Status:** ✅ Fully Implemented with Real Sensor Data Analysis
