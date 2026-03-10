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
