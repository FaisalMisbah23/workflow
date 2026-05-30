# File Organization Plan

## Project Overview
- **Type**: React Native Expo App with Expo Router
- **Languages**: TypeScript, JavaScript
- **Framework**: Expo, React Native, NativeWind (Tailwind CSS)
- **Pattern**: File-based routing with Expo Router

## Current State Analysis

### Existing Structure (Good)
```
project/
├── app/                    # Expo Router screens (correct pattern)
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root stack layout
│   ├── index.tsx          # Landing page
│   ├── signin.tsx         # Sign in screen
│   ├── signup.tsx         # Sign up screen
│   ├── createorganization.jsx  # Create org screen
│   ├── createtask.tsx     # Create task screen
│   └── info.tsx           # Info/profile screen
├── components/            # Reusable UI components
├── constants/             # App constants
├── context/               # React context providers
├── lib/                   # Utilities and clients (Supabase)
├── assets/               # Static images
├── supabase/             # Supabase Edge Functions
└── Various config files at root (standard for Expo)
```

### Issues Identified
1. **Missing test infrastructure**: No `tests/` directory
2. **Empty `docs/` directory**: No documentation files
3. **Misplaced `global.css`**: Located at root, should be in `assets/styles/`
4. **Obsolete `server.js`**: Contains unused credentials, unreferenced
5. **Documentation incomplete**: No project documentation beyond README

## Target Structure

```
project/
├── app/                          # Expo Router (unchanged)
│   ├── (tabs)/                  # Tab screens
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── signin.tsx
│   ├── signup.tsx
│   ├── createorganization.jsx
│   ├── createtask.tsx
│   └── info.tsx
├── assets/
│   ├── images/                  # Current image assets (unchanged)
│   └── styles/
│       └── global.css           # MOVED FROM root
├── components/                   # UI components (unchanged)
├── constants/                    # Constants (unchanged)
├── context/                      # Context providers (unchanged)
├── lib/                          # Utilities (unchanged)
├── supabase/                     # Edge functions (unchanged)
├── tests/                        # NEW - test directory
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/                         # NEW - documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── COMPONENTS.md
│   ├── CONTRIBUTING.md
│   ├── DEVELOPMENT.md
│   ├── STYLING.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   └── GLOSSARY.md
├── scripts/                      # NEW - build/deploy scripts (optional)
├── .env                          # Environment (root - standard)
├── package.json
├── package-lock.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── eslint.config.js
├── app.json
├── README.md
└── other config files (standard location)
```

## Files to Move

| Current Path | Target Path | Reason |
|-------------|-------------|--------|
| `global.css` | `assets/styles/global.css` | Styles belong with assets |

## Files to Delete

| File | Reason |
|------|--------|
| `server.js` | Unreferenced obsolete file containing credentials |

## Files to Create

### New Directories
- `assets/styles/` - CSS and style files
- `tests/` - Test directory structure
- `docs/` - Documentation (9 standard files)

## Import Path Updates

### Files Requiring Updates
1. **app/_layout.tsx** (line 2)
   - `import "@/global.css"` → `import "@/assets/styles/global.css"`

2. **metro.config.js** (line 6)
   - `input: "./global.css"` → `input: "./assets/styles/global.css"`

## Dependencies Analysis

### No Circular Dependencies
The `global.css` file is a stylesheet imported only in `_layout.tsx` and referenced in Metro config. No other files import it directly.

### Safe to Move
- `global.css` has only two references - easy to update
- No runtime dependencies on file location beyond those imports

## Risk Assessment

### Low Risk Changes
- Moving CSS file with two references is straightforward
- Deleting unreferenced `server.js` is safe

### No Breaking Changes Expected
- No test suite to validate (zero tests exist)
- Import updates are minimal and localized

## Success Criteria

- [ ] `global.css` moved to `assets/styles/` with all imports updated
- [ ] `server.js` deleted
- [ ] `assets/styles/` directory created
- [ ] Lint passes without errors
- [ ] TypeScript compilation succeeds
- [ ] App starts successfully after changes
- [ ] Documentation directories created with standard 9 files
- [ ] Git history preserved using `git mv` and `git rm`

## Migration Commands

```bash
# Step 1: Create branch
git checkout -b refactor/file-organization

# Step 2: Create directories
mkdir -p assets/styles tests/{unit,integration,fixtures} docs

# Step 3: Move global.css
git mv global.css assets/styles/global.css

# Step 4: Update imports
# (manual edit of app/_layout.tsx and metro.config.js)

# Step 5: Delete server.js
git rm server.js

# Step 6: Commit
git add -A
git commit -m "refactor: reorganize file structure

- Move global.css to assets/styles/
- Delete obsolete server.js
- Create tests/ and docs/ directories"

# Step 7: Create docs files (blank templates)
for doc in ARCHITECTURE.md API.md COMPONENTS.md CONTRIBUTING.md DEVELOPMENT.md STYLING.md TESTING.md DEPLOYMENT.md GLOSSARY.md; do
  touch "docs/$doc"
done

# Step 8: Verify
npm run lint
npx tsc --noEmit
```

## Verification Steps

1. **Type Check**: `npx tsc --noEmit`
2. **Lint**: `npm run lint`
3. **Build**: `npx expo export --platform web` (if accessible)
4. **Manual verification**: Start expo server and check for 404 on assets

## Notes

- Expo Router expects `app/` directory structure to remain unchanged
- Config files at root are standard for Expo/React Native
- `.env` should remain at root (common convention) and is already in .gitignore pattern? (`.env*.local` but not `.env` - but `.env` is tracked)
- `supabase/` functions follow Supabase conventions, keep as-is
- No tests exist, so no test migration needed
