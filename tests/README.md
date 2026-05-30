# Test Suite

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Test Structure

```
tests/
├── __mocks__/           # Mocks and fixtures
├── unit/                # Unit tests
│   ├── context/         # Context tests
│   └── components/      # Component tests
├── integration/         # Integration tests
└── e2e/                 # E2E tests
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | With coverage report |
| `npm run test:ci` | CI mode |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run test:e2e` | E2E tests only |

## Writing Tests

### Test File Naming
- Unit tests: `ComponentName.test.tsx` or `FunctionName.test.js`
- Integration tests: `FeatureName.test.jsx`
- E2E tests: `WorkflowName.e2e.test.js`

### Test Structure
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Fixtures

Import test data from `tests/__mocks__/fixtures.js`:

```javascript
import { mockUser, mockTask, mockNotification } from '../__mocks__/fixtures';
```

## Mocks

Use utility functions from `tests/__mocks__/testUtils.js`:

```javascript
import { buildMockSupabaseClient, wait } from '../__mocks__/testUtils';
```

## Coverage

Current coverage thresholds:
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

View coverage report after running `npm run test:coverage`.

## Debugging

```bash
# Run specific test file
npm test -- tests/unit/context/UserContext.test.jsx

# Run with verbose output
npm test -- --verbose

# Run specific test name
npm test -- --testNamePattern="should login"
```

## Best Practices

1. Use fixtures for test data
2. Mock external APIs (Supabase)
3. Clean up after each test (`beforeEach`)
4. Use descriptive test names
5. Follow Arrange-Act-Assert pattern
