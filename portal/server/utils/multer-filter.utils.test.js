import filter, { formatBytes } from './multer-filter.utils';

describe('utils/multer-filter.utils formatBytes', () => {
  const manualInclusionFileSize = 12582912; // == 12mb
  const defaultFileSize = 10485760; // == 10mb
  it('returns the file size formatted in MB', () => {
    expect(formatBytes(manualInclusionFileSize)).toEqual('12 MB');
    expect(formatBytes(defaultFileSize)).toEqual('10 MB');
  });

  it('returns the file size formatted in Bytes', () => {
    expect(formatBytes(0)).toEqual('0 Bytes');
    expect(formatBytes(1234)).toEqual('1.21 KB');
  });

  it('returns the file size formatted in GB', () => {
    expect(formatBytes(1234456712)).toEqual('1.15 GB');
  });

  it('returns the file size formatted in GB', () => {
    expect(formatBytes()).toEqual('0 Bytes');
  });
});

describe('utils/multer-filter.utils multerFilter', () => {
  it('calls the multerFilter function', () => {
    const req = {
      params: {
        documentType: 'manual-inclusion-questionnaire',
      },

      headers: {
        'content-length': 12345,
      },
    };
    const file = {
      originalname: 'file1.png',
    };
    const cb = () => '';

    const multer = jest.spyOn(filter, 'multerFilter');
    filter.multerFilter(req, file, cb);
    expect(multer).toBeCalled();
  });
});

describe('utils/multer-filter.utils utilisationReportMulterFilter', () => {
  it('calls the utilisationReportMulterFilter function', () => {
    const req = {
      params: {
        documentType: 'utilisation-report',
      },

      headers: {
        'content-length': 12345,
      },
    };
    const file = {
      originalname: 'utilisation-report.csv',
    };
    const cb = () => '';

    const multer = jest.spyOn(filter, 'utilisationReportMulterFilter');
    filter.utilisationReportMulterFilter(req, file, cb);
    expect(multer).toBeCalled();
  });
});
