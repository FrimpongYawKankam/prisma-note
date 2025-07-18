# Mock Functionality Implementation

## 🎭 Overview

This mock functionality system allows frontend development without requiring a running backend server. It provides complete simulation of all API endpoints with realistic data and network delays.

## 🚀 Quick Start

### To Enable Mock Mode:
1. Open `src/mockFunctionality/utils/constants.ts`
2. Set `USE_MOCK: true`
3. Restart the app

### To Disable Mock Mode:
1. Set `USE_MOCK: false` in constants.ts
2. Restart the app

## 🔐 Test Credentials

- **Email:** `testemail@example.com`
- **Password:** `Test123=`
- **User:** TestUser

## 📱 Features

### Mock Services:
- ✅ **Authentication** - Login, register, logout, OTP verification
- ✅ **Notes** - CRUD operations, search, auto-save
- ✅ **Events** - Sample event data
- ✅ **Network Simulation** - Realistic delays (400-800ms)
- ✅ **Data Persistence** - Uses AsyncStorage to maintain state

### Mock Data:
- 👤 **1 Test User** with complete profile
- 📝 **6 Sample Notes** with rich content (markdown, lists, recipes, etc.)
- 📅 **5 Sample Events** with various types
- 🔄 **Auto-reset** capability for consistent testing

## 🛠️ Development Tools

### Debug Panel
- Shows current service mode (Mock/Real)
- Displays mock data status
- Buttons to reset/clear mock data
- Visible only in development mode

### Console Logging
When mock mode is enabled, you'll see:
```
🔧 Using Mock Auth Service
🔧 Using Mock Note Service
🎭 Mock functionality initialized
📧 Test Email: testemail@example.com
🔑 Test Password: Test123=
```

## 📁 File Structure

```
src/mockFunctionality/
├── index.ts                    # Service factory & main exports
├── mockData/
│   ├── users.ts               # Test user data
│   ├── notes.ts               # Sample notes (6 items)
│   ├── events.ts              # Sample events (5 items)
│   └── index.ts               # Export all mock data
├── mockServices/
│   ├── mockAuthService.ts     # Authentication simulation
│   └── mockNoteService.ts     # Notes CRUD simulation
└── utils/
    ├── constants.ts           # Configuration & settings
    └── mockUtils.ts           # Helper functions
```

## 🔧 Configuration

### Main Settings (`constants.ts`):
```typescript
export const MOCK_CONFIG = {
  USE_MOCK: true,              // Toggle mock mode
  DELAYS: {
    AUTH: 800,                 // Login delay (ms)
    NOTES: 600,                # Note operations delay
    SEARCH: 400,               # Search delay
  },
  TEST_USER: {
    email: 'testemail@example.com',
    password: 'Test123=',
    fullName: 'TestUser'
  }
};
```

## 🎯 Usage Examples

### Testing Login Flow:
1. Open app
2. Go to login screen
3. Use: `testemail@example.com` / `Test123=`
4. Login should work instantly with mock data

### Testing Notes:
1. Login with test credentials
2. See 6 pre-loaded sample notes
3. Create new notes (they persist during session)
4. Edit/delete notes (changes are saved)
5. Search functionality works

### Resetting Data:
- Use debug panel "Reset Data" button
- Or programmatically: `mockDataUtils.resetMockData()`

## 🔄 Service Factory

The system automatically chooses between mock and real services:

```typescript
// AuthContext automatically uses the right service
const authService = createAuthService();

// NotesContext automatically uses the right service  
const noteService = createNoteService();
```

## 📊 Mock Data Details

### Sample Notes Include:
1. **Welcome Guide** - App introduction with markdown
2. **Meeting Notes** - Business meeting with checkboxes
3. **Recipe** - Chocolate chip cookies with ingredients
4. **Book Notes** - Learning concepts and takeaways
5. **Travel List** - Bucket list with checkboxes
6. **Quick Ideas** - Random thoughts and quotes

### Sample Events Include:
- Team meetings
- Personal appointments
- Project deadlines
- Social events
- Gym sessions

## 🐛 Troubleshooting

### Common Issues:

1. **"Cannot find module" errors**
   - Restart Metro bundler
   - Clear cache: `expo start --clear`

2. **Mock not working**
   - Check `USE_MOCK` is `true` in constants.ts
   - Restart app after changing setting

3. **No mock data showing**
   - Use debug panel "Reset Data"
   - Check console for error messages

4. **Real backend still being used**
   - Verify service factory imports in contexts
   - Check console logs for service type

## 🎨 For Your Partner

To work purely on frontend without backend:

1. Set `USE_MOCK: true` in `src/mockFunctionality/utils/constants.ts`
2. Use test credentials: `testemail@example.com` / `Test123=`
3. All features work normally with sample data
4. Changes persist during app session
5. Use debug panel to reset data when needed

The app will behave exactly like the real version but with simulated network delays and predefined data.

## ⚡ Performance

- Mock responses: 400-800ms delay (realistic)
- Data persistence: AsyncStorage (survives app restarts)
- Memory efficient: Only loads data when needed
- No network requests: Everything runs locally

---

**Happy Frontend Development! 🚀**
