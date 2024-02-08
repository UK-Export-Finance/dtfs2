const mockFiles = [];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

console.info('MOCKED FILES: \n %O', mockFiles.join('\n'));
