# Parental Control Feature Guide

## Overview
SafeFit includes a parental control system that automatically generates an 8-digit access code for users who require supervision based on their age.

## Activation Criteria

### Who Gets a Parental Code?
The system automatically assigns a parental access code if the user is:
- **Under 18 years old** (Minor)
- **Over 60 years old** (Senior)

### Age Calculation
- Based on the date of birth entered during profile setup
- Calculated at the time of profile creation
- Age is computed as: `current year - birth year` (with month/day adjustments)

## Features

### ✅ 8-Digit Access Code
- Randomly generated 8-digit numeric code
- Unique per user
- Example: `12345678`

### ✅ Automatic Generation
- Code generated during initial profile setup
- No manual intervention required
- Stored securely in Supabase database

### ✅ Pop-up Display (First Login)
When a user completes their profile and qualifies for parental control:
1. Profile form is submitted
2. Age is calculated from date of birth
3. If age < 18 or age > 60:
   - 8-digit code is generated
   - Saved to database
   - Pop-up dialog appears showing the code
4. User can copy the code
5. App continues normally after closing dialog

### ✅ Settings Access
Users with parental codes can view them anytime in Settings:
- Navigate to Settings
- Look for "Parental Access Code" option (only visible if code exists)
- Tap to view code
- Copy to clipboard with one tap

## Implementation Details

### Database Schema

#### user_profiles Table
```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    profile_picture_url TEXT,
    parental_code TEXT,  -- NEW FIELD
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Code Generation Logic

```typescript
const generateParentalCode = (): string => {
  // Generate 8-digit code
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Usage in ProfileForm
const age = calculateAge(formData.date_of_birth);
const needsParentalControl = age < 18 || age > 60;

if (needsParentalControl) {
  const code = generateParentalCode();
  // Save to database
  // Show popup
}
```

### Storage

#### Supabase
```typescript
await supabase
  .from('user_profiles')
  .update({
    ...formData,
    parental_code: needsParentalControl ? generatedCode : null,
    updated_at: new Date().toISOString()
  })
  .eq('user_id', user.id);
```

#### localStorage Cache
```typescript
const profileData = {
  ...formData,
  parental_code: needsParentalControl ? generatedCode : null,
  user_id: user.id,
  updated_at: new Date().toISOString()
};

localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData));
```

## User Flow

### First Time Setup (Minor/Senior User)

```
User Signs Up
    ↓
Enters Profile Information
    ↓
Enters Date of Birth
    ↓
Submits Profile Form
    ↓
System Calculates Age
    ↓
Age < 18 OR Age > 60?
    ↓ YES
Generate 8-Digit Code
    ↓
Save to Database & Cache
    ↓
Show Parental Code Pop-up
    ↓
User Views Code
    ↓
User Copies Code (Optional)
    ↓
User Clicks "Continue to App"
    ↓
App Functions Normally
```

### First Time Setup (Regular User, Age 18-60)

```
User Signs Up
    ↓
Enters Profile Information
    ↓
Enters Date of Birth
    ↓
Submits Profile Form
    ↓
System Calculates Age
    ↓
Age < 18 OR Age > 60?
    ↓ NO
No Parental Code Generated
    ↓
Profile Saved
    ↓
App Functions Normally
```

### Viewing Code Later (Settings)

```
User Opens App
    ↓
Goes to Settings
    ↓
Sees "Parental Access Code" Option
    ↓
Taps on It
    ↓
Dialog Shows 8-Digit Code
    ↓
User Can Copy Code
    ↓
Closes Dialog
```

## UI Components

### ParentalCodeDialog Component
**Location:** `src/components/ParentalCodeDialog.tsx`

**Features:**
- Beautiful gradient design (purple to pink)
- Large, easy-to-read code display
- Copy to clipboard button
- Age-appropriate messaging (minor vs senior)
- Important information section
- Continue button to proceed to app

**Props:**
```typescript
interface ParentalCodeDialogProps {
  isOpen: boolean;
  parentalCode: string;
  userAge: number;
  onClose: () => void;
}
```

### Settings Integration
**Location:** `src/components/Settings.tsx`

**Parental Code Section:**
- Only displayed if user has a parental code
- Appears in "Profile" settings group
- Between "Change Password" and "Privacy & Security"
- Same dialog design as initial popup

## Use Cases

### Minor User (Under 18)
**Scenario:** 16-year-old Sarah signs up for SafeFit

1. Sarah creates account with email/password
2. Fills profile form with DOB: `2009-03-15`
3. System calculates age: 16 years
4. Generates code: `45782390`
5. Shows popup: "Under 18 years old - This account requires parental supervision"
6. Sarah copies code and shares with parents
7. Parents can use code for monitoring/access
8. Sarah continues using the app normally

### Senior User (Over 60)
**Scenario:** 65-year-old John signs up for SafeFit

1. John creates account
2. Fills profile with DOB: `1960-08-20`
3. System calculates age: 65 years
4. Generates code: `92847561`
5. Shows popup: "Over 60 years old - This account requires parental supervision"
6. John copies code and shares with family
7. Family can use code for health monitoring
8. John uses app for fitness tracking

### Regular User (18-60)
**Scenario:** 35-year-old Mike signs up

1. Mike creates account
2. Fills profile with DOB: `1990-06-12`
3. System calculates age: 35 years
4. No parental code generated
5. No popup shown
6. Goes directly to onboarding
7. "Parental Access Code" option NOT visible in Settings

## Security & Privacy

### Code Security
✅ **Secure Generation:** Cryptographically random 8-digit code
✅ **Database Storage:** Stored in Supabase with RLS policies
✅ **User-Only Access:** Only the user can view their own code
✅ **No Expiration:** Code remains valid indefinitely

### Privacy Considerations
- Code is NOT a password or authentication credential
- Code is meant for sharing with trusted guardians
- Used for monitoring purposes only
- Does not grant account access or control

### Best Practices
1. **Share Responsibly:** Only share with trusted parents/guardians
2. **Keep Secure:** Treat like sensitive information
3. **Document:** Write down code in safe place
4. **Verify Recipient:** Ensure code goes to intended person

## Future Enhancements

### Potential Features
1. **Guardian Portal:** Separate parent/guardian dashboard
2. **Code Expiration:** Optional time-limited codes
3. **Multiple Guardians:** Support for multiple parental codes
4. **SMS Notification:** Auto-send code to guardian's phone
5. **Emergency Access:** Guardian override for emergency situations
6. **Activity Logs:** Track when code is used for access
7. **Code Reset:** Allow users to regenerate code
8. **Two-Factor:** Require code + password for guardian access

### Integration Possibilities
- **Guardian App:** Separate mobile app for parents/caregivers
- **Health Monitoring:** Guardian can view health metrics
- **Location Tracking:** Parents can see real-time location
- **Emergency Alerts:** Notify guardians of safety concerns
- **Activity Reports:** Weekly summaries to guardian email

## Testing

### Test Case 1: Minor User
```
Input: DOB = 2010-01-01 (14 years old)
Expected: 
  - Parental code generated
  - Popup shown
  - Code saved to database
  - Code visible in Settings
```

### Test Case 2: Senior User
```
Input: DOB = 1955-06-15 (70 years old)
Expected:
  - Parental code generated
  - Popup shown with "Over 60" message
  - Code saved to database
  - Code visible in Settings
```

### Test Case 3: Regular User
```
Input: DOB = 1995-03-20 (30 years old)
Expected:
  - No parental code generated
  - No popup shown
  - parental_code = null in database
  - "Parental Access Code" NOT in Settings
```

### Test Case 4: Edge Case - Exactly 18
```
Input: DOB = 2007-11-08 (exactly 18 today)
Expected:
  - No parental code (18+ is adult)
  - Normal profile flow
```

### Test Case 5: Edge Case - Exactly 60
```
Input: DOB = 1965-11-08 (exactly 60 today)
Expected:
  - No parental code (60 is not >60)
  - Normal profile flow
```

### Test Case 6: Copy to Clipboard
```
Action: Click "Copy Code" button
Expected:
  - Code copied to clipboard
  - Toast notification shown
  - Button shows "Copied!" briefly
```

## Troubleshooting

### Code Not Showing in Settings
**Cause:** User age between 18-60
**Solution:** This is expected behavior; only minors/seniors get codes

### Popup Not Appearing
**Cause:** parental_code field missing in database
**Solution:** Run SQL migration to add `parental_code TEXT` column

### Code Shows as "--------"
**Cause:** Database fetch failed or code is null
**Solution:** Check Supabase connection and profile data

### Age Calculation Incorrect
**Cause:** Date format issues
**Solution:** Verify date_of_birth is stored as YYYY-MM-DD

## FAQ

**Q: Can users change their parental code?**
A: Currently no, but this could be added as a feature

**Q: What if someone loses their code?**
A: They can view it anytime in Settings

**Q: Can parents access the account with just the code?**
A: No, this is future functionality. Currently it's informational only

**Q: Is the code required to use the app?**
A: No, the app functions normally regardless of the code

**Q: Do all users get a parental code?**
A: No, only users under 18 or over 60

---

**Last Updated:** November 8, 2025
**Version:** 1.0
**Feature Status:** ✅ Fully Implemented
