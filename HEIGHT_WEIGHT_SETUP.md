# Height & Weight Profile Fields - Setup Guide

## Overview
This guide explains how to set up and use the height and weight fields in user profiles with proper database schema and async storage.

## Database Schema Update

### 1. Run the Migration in Supabase

Go to your Supabase project dashboard:
1. Navigate to **SQL Editor**
2. Run the migration file: `supabase/migrations/add_height_weight_to_profiles.sql`
3. Or manually execute:

```sql
-- Add height and weight columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS height NUMERIC,
ADD COLUMN IF NOT EXISTS height_unit VARCHAR(10) DEFAULT 'cm',
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10) DEFAULT 'kg';

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.height IS 'User height value';
COMMENT ON COLUMN user_profiles.height_unit IS 'Unit of measurement for height (cm or ft)';
COMMENT ON COLUMN user_profiles.weight IS 'User weight value';
COMMENT ON COLUMN user_profiles.weight_unit IS 'Unit of measurement for weight (kg or lbs)';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_height ON user_profiles(height);
CREATE INDEX IF NOT EXISTS idx_user_profiles_weight ON user_profiles(weight);
```

### 2. Updated Table Structure

After migration, your `user_profiles` table will have:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| user_id | uuid | - | Foreign key to auth.users |
| full_name | text | - | User's full name |
| phone | text | - | Phone number |
| date_of_birth | date | - | Date of birth |
| gender | text | - | Gender (male/female/other) |
| address | text | - | User address |
| **height** | **numeric** | - | **Height value** |
| **height_unit** | **varchar(10)** | **'cm'** | **Height unit (cm/ft)** |
| **weight** | **numeric** | - | **Weight value** |
| **weight_unit** | **varchar(10)** | **'kg'** | **Weight unit (kg/lbs)** |
| parental_code | text | - | 8-digit code for parental control |
| created_at | timestamp | now() | Profile creation timestamp |
| updated_at | timestamp | now() | Last update timestamp |

## Data Storage Strategy

### Dual Storage Approach

The ProfileForm component now stores data in **two locations** for maximum compatibility:

#### 1. **Supabase Database** (Primary Storage)
- Permanent storage
- Synced across devices
- Used for data retrieval and analytics

#### 2. **Async Storage** (Local Cache)

**Web (Browser):**
```javascript
localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData));
```

**Mobile (iOS/Android):**
```javascript
await Preferences.set({
  key: `profile_${user.id}`,
  value: JSON.stringify(profileData)
});
```

### Why Dual Storage?

1. **Offline Access**: Local storage allows the app to work offline
2. **Performance**: Instant data access without network calls
3. **Cross-Platform**: Works on web and mobile
4. **Backup**: Database serves as source of truth

## Code Implementation

### ProfileForm.tsx Changes

```typescript
// Import Capacitor Preferences for mobile async storage
import { Preferences } from '@capacitor/preferences';

// Save to Supabase
const { error } = await supabase
  .from('user_profiles')
  .update({
    full_name: formData.full_name,
    phone: formData.phone,
    date_of_birth: formData.date_of_birth,
    gender: formData.gender,
    address: formData.address,
    height: parseFloat(formData.height),        // Convert to number
    height_unit: formData.height_unit,
    weight: parseFloat(formData.weight),        // Convert to number
    weight_unit: formData.weight_unit,
    parental_code: needsParentalControl ? generatedCode : null,
    updated_at: new Date().toISOString()
  })
  .eq('user_id', user.id);

// Save to local storage (web and mobile)
const profileData = {
  full_name: formData.full_name,
  phone: formData.phone,
  date_of_birth: formData.date_of_birth,
  gender: formData.gender,
  address: formData.address,
  height: parseFloat(formData.height),
  height_unit: formData.height_unit,
  weight: parseFloat(formData.weight),
  weight_unit: formData.weight_unit,
  parental_code: needsParentalControl ? generatedCode : null,
  user_id: user.id,
  updated_at: new Date().toISOString()
};

// Web storage
localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData));

// Mobile storage (Capacitor)
try {
  await Preferences.set({
    key: `profile_${user.id}`,
    value: JSON.stringify(profileData)
  });
} catch (prefError) {
  console.log('Capacitor Preferences not available (web mode):', prefError);
}
```

## Reading Stored Data

### From Local Storage (Web)

```typescript
const profileJson = localStorage.getItem(`profile_${user.id}`);
if (profileJson) {
  const profile = JSON.parse(profileJson);
  console.log(`Height: ${profile.height} ${profile.height_unit}`);
  console.log(`Weight: ${profile.weight} ${profile.weight_unit}`);
}
```

### From Capacitor Preferences (Mobile)

```typescript
const { value } = await Preferences.get({ key: `profile_${user.id}` });
if (value) {
  const profile = JSON.parse(value);
  console.log(`Height: ${profile.height} ${profile.height_unit}`);
  console.log(`Weight: ${profile.weight} ${profile.weight_unit}`);
}
```

### From Supabase (Universal)

```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .select('height, height_unit, weight, weight_unit')
  .eq('user_id', user.id)
  .single();

if (data) {
  console.log(`Height: ${data.height} ${data.height_unit}`);
  console.log(`Weight: ${data.weight} ${data.weight_unit}`);
}
```

## UI Features

### Form Fields

- **Height Input**: Number field with cm/ft selector
- **Weight Input**: Number field with kg/lbs selector
- **Icons**: Ruler icon for height, Weight icon for weight
- **Validation**: Both fields are required

### Example Values

| Input | Stored Value | Display |
|-------|--------------|---------|
| Height: 175, Unit: cm | `height: 175, height_unit: 'cm'` | 175 cm |
| Height: 5.9, Unit: ft | `height: 5.9, height_unit: 'ft'` | 5.9 ft |
| Weight: 70, Unit: kg | `weight: 70, weight_unit: 'kg'` | 70 kg |
| Weight: 154, Unit: lbs | `weight: 154, weight_unit: 'lbs'` | 154 lbs |

## Testing

### 1. Test Profile Creation

1. Start the app with a new user
2. Complete profile with height and weight
3. Check Supabase dashboard to verify data
4. Check browser's LocalStorage in DevTools
5. On mobile, verify Capacitor Preferences storage

### 2. Verify Data Retrieval

```typescript
// In any component with user context
useEffect(() => {
  const loadProfile = async () => {
    // Try local storage first (faster)
    const cachedProfile = localStorage.getItem(`profile_${user.id}`);
    
    if (cachedProfile) {
      const profile = JSON.parse(cachedProfile);
      console.log('Height:', profile.height, profile.height_unit);
      console.log('Weight:', profile.weight, profile.weight_unit);
    } else {
      // Fallback to Supabase
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        console.log('Height:', data.height, data.height_unit);
        console.log('Weight:', data.weight, data.weight_unit);
      }
    }
  };
  
  loadProfile();
}, [user.id]);
```

## Data Conversion (Optional)

If you want to convert between units:

```typescript
// Height conversion
const cmToFeet = (cm: number) => cm / 30.48;
const feetToCm = (feet: number) => feet * 30.48;

// Weight conversion
const kgToLbs = (kg: number) => kg * 2.20462;
const lbsToKg = (lbs: number) => lbs / 2.20462;

// Usage
const heightInCm = formData.height_unit === 'ft' 
  ? feetToCm(parseFloat(formData.height))
  : parseFloat(formData.height);

const weightInKg = formData.weight_unit === 'lbs'
  ? lbsToKg(parseFloat(formData.weight))
  : parseFloat(formData.weight);
```

## Troubleshooting

### Issue: Data not saving to Supabase
- Check if migration ran successfully
- Verify column types match (numeric for height/weight)
- Check RLS policies on user_profiles table

### Issue: Local storage not working
- **Web**: Check browser console for localStorage errors
- **Mobile**: Ensure Capacitor Preferences plugin is installed: `npm install @capacitor/preferences`

### Issue: Invalid data types
- Ensure `parseFloat()` is used when saving to database
- Validate input is numeric before submission

## Next Steps

1. ✅ Run the migration in Supabase
2. ✅ Test profile creation with height/weight
3. ✅ Verify data in Supabase dashboard
4. ✅ Check local storage in browser DevTools
5. Consider adding BMI calculation using height/weight
6. Add data validation (min/max values)
7. Implement unit conversion if needed

## Related Files

- `src/components/ProfileForm.tsx` - Form component with height/weight fields
- `supabase/migrations/add_height_weight_to_profiles.sql` - Database migration
- `src/integrations/supabase/client.ts` - Supabase client configuration

---

**Note**: Always use `parseFloat()` when saving height and weight to ensure they're stored as numbers in the database, not strings.
