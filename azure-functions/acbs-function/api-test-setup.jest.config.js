const mockFiles = [];

jest.mock(mockFiles);

console.info(`MOCKED FILES: \n${mockFiles.join('\n')}`);
