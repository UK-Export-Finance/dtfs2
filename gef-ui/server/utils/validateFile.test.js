import validateFile from './validateFile';

describe('utils/validateFile', () => {
  let mockFile;

  beforeEach(() => {
    mockFile = {
      originalname: 'mock-file.doc',
      size: 1024 * 1024 * 5,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an error if invalid file format passed', () => {
    expect(validateFile()).toEqual([false, 'Invalid file']);
  });

  it('returns an error if file is incorrect format', () => {
    mockFile.originalname = 'mock-file.exe';

    expect(validateFile(mockFile)).toEqual([false, 'mock-file.exe must be a BMP, DOC, DOCX, GIF, JPEG, JPG, PDF, PNG, PPT, PPTX, TIF, TXT, XLS or XLSX']);
  });

  it('returns an error if file is in a `zip` extension', () => {
    mockFile.originalname = 'mock-file.zip';

    expect(validateFile(mockFile)).toEqual([false, 'mock-file.zip must be a BMP, DOC, DOCX, GIF, JPEG, JPG, PDF, PNG, PPT, PPTX, TIF, TXT, XLS or XLSX']);
  });

  it('returns an error if file is in a `msg` extension', () => {
    mockFile.originalname = 'mock-file.msg';

    expect(validateFile(mockFile)).toEqual([false, 'mock-file.msg must be a BMP, DOC, DOCX, GIF, JPEG, JPG, PDF, PNG, PPT, PPTX, TIF, TXT, XLS or XLSX']);
  });

  it('returns an error if file is over 10MB', () => {
    mockFile.size = 1024 * 1024 * 50;

    expect(validateFile(mockFile)).toEqual([false, 'mock-file.doc must be smaller than 10MB']);
  });

  it('returns valid if file is valid', () => {
    expect(validateFile(mockFile)).toEqual([true, null]);
  });

  it('validates if passed different size', () => {
    const customFileSize = 2;
    mockFile.size = 1024 * 1024 * 5;
    expect(validateFile(mockFile, customFileSize)).toEqual([false, 'mock-file.doc must be smaller than 2MB']);

    mockFile.size = customFileSize - 1;
    expect(validateFile(mockFile, customFileSize)).toEqual([true, null]);
  });

  it('validates if passed custom file extension list', () => {
    expect(validateFile(mockFile, undefined, ['jpg', 'pdf'])).toEqual([false, 'mock-file.doc must be a JPG or PDF']);

    mockFile.originalname = 'mock-file.jpg';
    expect(validateFile(mockFile, undefined, ['jpg', 'pdf'])).toEqual([true, null]);
  });
});
