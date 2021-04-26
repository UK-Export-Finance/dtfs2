const mockFiles = [];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

console.log(`MOCKED FILES: \n${mockFiles.join('\n')}`);
