const mockFiles = [];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});
