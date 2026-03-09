// Ensure portal 2FA feature flag is enabled for api tests so feature-flagged
// routes are available in the test environment.
process.env.FF_PORTAL_2FA_ENABLED = 'true';

beforeAll(async () => {
  if (!console.error.mock) {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  }
});

afterAll(async () => {
  if (console.error.mock) {
    console.error.mockRestore();
  }
});
