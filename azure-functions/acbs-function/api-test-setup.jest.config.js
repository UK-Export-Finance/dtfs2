const mockFiles = [];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

console.info('MOCKED FILES: \n %s', mockFiles.join('\n'));
