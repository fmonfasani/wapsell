# Testing Guide — Wapsell

## Backend Tests (Python/Pytest)

### Run Backend Tests

```bash
cd services/api
pip install -r requirements.txt
pytest test_main.py -v
```

### Test Coverage

- ✅ Health check endpoint
- ✅ User registration (success, validation, duplicates)
- ✅ User login (success, invalid credentials)
- ✅ Session management (`/auth/me`, `/auth/logout`)
- ✅ Chat endpoint (basic messages, topic variations)

### Example Test Output

```
test_main.py::TestHealth::test_health_check PASSED
test_main.py::TestAuth::test_register_success PASSED
test_main.py::TestAuth::test_register_invalid_email PASSED
test_main.py::TestAuth::test_register_weak_password PASSED
test_main.py::TestAuth::test_register_duplicate_email PASSED
test_main.py::TestAuth::test_login_success PASSED
test_main.py::TestAuth::test_login_invalid_password PASSED
test_main.py::TestAuth::test_get_me_authenticated PASSED
test_main.py::TestAuth::test_get_me_unauthenticated PASSED
test_main.py::TestAuth::test_logout PASSED
test_main.py::TestChat::test_chat_message PASSED
test_main.py::TestChat::test_chat_different_topics PASSED

============ 12 passed in 0.25s ============
```

## Frontend Tests (TypeScript/Jest)

### Setup Frontend Tests

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom typescript ts-jest @types/jest
```

### Run Frontend Tests

```bash
npm test
```

### Current Test Files

- `lib/useAuth.test.ts` — Template for useAuth hook tests
  - Requires React Testing Library setup
  - Tests auth state management
  - Tests protected route behavior

### Manual Testing

For now, manual testing in the browser is recommended:

1. **Register Flow**
   - Go to `/auth/register`
   - Fill form with valid data
   - Should redirect to `/demo`

2. **Login Flow**
   - Go to `/auth/login`
   - Enter credentials
   - Should redirect to `/demo`

3. **Protected Routes**
   - Try accessing `/demo` without login
   - Should redirect to `/auth/login`

4. **Chat**
   - Log in and go to `/demo`
   - Type messages
   - Should get responses

5. **Logout**
   - Click user menu
   - Click "Cerrar sesión"
   - Should redirect to `/auth/login`

## Integration Tests

For end-to-end testing of the full flow, consider:

- **Cypress**: Browser automation for full user flows
- **Playwright**: Cross-browser testing
- **Postman**: API collection for manual testing

## CI/CD Integration

Tests run automatically on:
- ✅ GitHub Actions on every push
- Manual run: `pytest test_main.py` in CI workflow

## Test-Driven Development

When adding features:

1. Write test first
2. Implement feature
3. Run tests to verify
4. Refactor as needed
5. Commit with test coverage

## Known Limitations

- Frontend tests are template-only (needs React Testing Library setup)
- Integration tests between frontend and backend need Cypress/Playwright
- Database tests use SQLite in-memory (safe for testing)
- Mock chat responses don't test LLM integration (future)

## Next Steps

- [ ] Set up React Testing Library for frontend unit tests
- [ ] Add Cypress for E2E testing
- [ ] Add test coverage reporting
- [ ] Add performance benchmarks
