# Profile Storage Implementation Guide

## Overview
This guide explains how user profile data is stored and managed in the SafeFit application using localStorage (async storage).

## Key Features

### ✅ One-Time Profile Collection
- Profile information is collected only once during initial signup
- Subsequent app opens retrieve data from cached storage
- No repetitive form filling required

### ✅ Async Storage Implementation
- Profile data stored in browser localStorage (key: `profile_${userId}`)
- Automatic caching after successful Supabase save
- Fast profile loading from cache on subsequent visits

### ✅ Real Data in Settings
- Settings screen displays actual user-provided information
- No fake/mock data used
- Profile updates sync to both Supabase and localStorage

## Data Flow

### 1. Initial Signup Flow
```
User Signs Up → Profile Form → Save to Supabase → Cache in localStorage → Continue to App
```

### 2. Subsequent App Opens
```
App Opens → Check localStorage → Profile Found? → Skip Profile Form → Load Main App
                                → Profile Missing? → Fetch from Supabase → Cache → Main App
```

### 3. Profile Updates (in Settings)
```
User Edits Profile → Save to Supabase → Update localStorage Cache → UI Refreshes
```

## Implementation Details

### ProfileForm Component
**Location:** `src/components/ProfileForm.tsx`

**Key Functions:**
- Collects: Full Name, Phone, Date of Birth, Gender, Address
- Saves to Supabase `user_profiles` table
- Caches to localStorage: `localStorage.setItem('profile_${user.id}', JSON.stringify(profile))`

### Index (Main App Router)
**Location:** `src/pages/Index.tsx`

**Profile Check Logic:**
```typescript
const handleExistingUser = async (authUser: User) => {
  // 1. Check localStorage first (fast)
  const cachedProfile = localStorage.getItem(`profile_${authUser.id}`);
  
  if (cachedProfile) {
    const profile = JSON.parse(cachedProfile);
    // Skip profile form if data exists
    if (profile.full_name && profile.phone) {
      setCurrentScreen('onboarding'); // or 'subscription' or 'main'
      return;
    }
  }

  // 2. Fallback to Supabase (slow but reliable)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', authUser.id)
    .single();

  if (profile?.full_name && profile?.phone) {
    // Cache it for next time
    localStorage.setItem(`profile_${authUser.id}`, JSON.stringify(profile));
    // Skip profile form
  } else {
    // Show profile form
    setCurrentScreen('profile');
  }
};
```

### Settings Component
**Location:** `src/components/Settings.tsx`

**Profile Display:**
- Fetches from localStorage on mount
- Falls back to Supabase if cache miss
- Displays real user data (no fake data)

**Profile Update:**
```typescript
const handlePersonalInfoSubmit = async () => {
  // 1. Update Supabase
  await supabase.from('user_profiles').update(formData).eq('user_id', user.id);
  
  // 2. Update localStorage cache
  localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
  
  // 3. Update UI state
  setUserProfile(updatedProfile);
};
```

## Storage Schema

### localStorage Key Format
```
profile_${userId}
```

### Stored Data Structure
```typescript
{
  user_id: string;
  full_name: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  address: string;
  updated_at: string;
}
```

### Other localStorage Keys
- `onboarding_${userId}` - Tracks if onboarding seen
- `subscription_${userId}` - Tracks subscription status

## User Experience

### First Time User
1. Signs up with email/password
2. Fills profile form once
3. Goes through onboarding
4. Selects subscription
5. Enters main app

### Returning User
1. Signs in
2. **No profile form** (data loaded from cache)
3. Directly to main app
4. Can view/edit profile in Settings

## Mobile Considerations

For production Android/iOS apps using Capacitor, consider upgrading to:

### Capacitor Preferences API
```typescript
import { Preferences } from '@capacitor/preferences';

// Save
await Preferences.set({
  key: `profile_${userId}`,
  value: JSON.stringify(profile)
});

// Load
const { value } = await Preferences.get({ key: `profile_${userId}` });
const profile = JSON.parse(value);
```

**Benefits:**
- Persists across app updates
- Native storage (faster)
- Better encryption options
- Automatic cloud backup (iOS)

## Testing

### Test Profile Storage
1. Sign up with new account
2. Fill profile form
3. Check browser DevTools → Application → localStorage
4. Should see `profile_${userId}` key
5. Close and reopen app
6. Should skip profile form

### Test Profile Updates
1. Go to Settings → Personal Information
2. Edit any field
3. Save changes
4. Check localStorage - should be updated
5. Refresh app - changes should persist

## Troubleshooting

### Profile Form Appears Every Time
**Cause:** localStorage cache not being set or cleared
**Solution:** 
- Check browser console for errors
- Verify `localStorage.setItem` is called after form submission
- Check if browser has cookies/storage disabled

### Settings Shows No Data
**Cause:** Profile not cached or Supabase fetch failed
**Solution:**
- Check network tab for Supabase request
- Verify user is authenticated
- Check localStorage has `profile_${userId}` key

### Data Not Syncing Between Devices
**Expected Behavior:** localStorage is device-specific
**Solution:** Always fetch from Supabase on first load if cache miss

## Security Notes

⚠️ **Do NOT store sensitive data in localStorage:**
- No passwords
- No payment information
- No authentication tokens (use Supabase session)

✅ **Safe to store:**
- User profile information
- App preferences
- UI state

## Future Enhancements

1. **Offline Support:** Queue profile updates when offline
2. **Encryption:** Encrypt sensitive profile fields
3. **Sync Indicator:** Show when data is syncing to Supabase
4. **Cache Invalidation:** Refresh cache after X days
5. **Multi-device Sync:** Use Supabase realtime for cross-device updates

---

**Last Updated:** November 8, 2025
**Version:** 1.0
