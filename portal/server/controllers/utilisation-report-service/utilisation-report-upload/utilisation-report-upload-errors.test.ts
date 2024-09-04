import httpMocks from 'node-mocks-http';
import { GetUploadErrorsRequest, GetUploadErrorsResponse, getUploadErrors } from './utilisation-report-upload-errors';
import { validateFilenameFormat } from './utilisation-report-filename-validator';
import { asLoggedInUserSession, LoggedInUserSession } from '../../../helpers/express-session';

jest.mock('./utilisation-report-filename-validator');
jest.mock('../../../helpers/express-session');

describe('utilisation-report-upload-errors', () => {
  const href = '#utilisation-report-file-upload';

  beforeAll(() => {
    jest.mocked(asLoggedInUserSession).mockImplementation((session) => session as LoggedInUserSession);
  });

  it('returns file upload error if it exists', () => {
    // Arrange
    const { res, req } = httpMocks.createMocks<GetUploadErrorsRequest, GetUploadErrorsResponse>(
      {},
      {
        locals: { fileUploadError: { text: 'Error' } },
      },
    );

    const expectedResponse = {
      uploadErrorSummary: [
        {
          text: 'Error',
          href,
        },
      ],
      uploadValidationError: { text: 'Error' },
    };

    // Act
    const response = getUploadErrors(req, res);

    // Assert
    expect(response).toEqual(expectedResponse);
  });

  it("returns 'please select a file' error if no file on request", () => {
    // Arrange
    const { res, req } = httpMocks.createMocks<GetUploadErrorsRequest, GetUploadErrorsResponse>({}, {});

    const expectedResponse = {
      uploadErrorSummary: [
        {
          text: 'Please select a file',
          href,
        },
      ],
      uploadValidationError: { text: 'Please select a file' },
    };

    // Act
    const response = getUploadErrors(req, res);

    // Assert
    expect(response).toEqual(expectedResponse);
  });

  it("returns 'selected file could not be uploaded' error if virus scan failed", () => {
    // Arrange
    const { res, req } = httpMocks.createMocks<GetUploadErrorsRequest, GetUploadErrorsResponse>(
      {
        file: {},
      },
      {
        locals: { virusScanFailed: { text: 'Error' } },
      },
    );

    const expectedResponse = {
      uploadErrorSummary: [
        {
          text: 'The selected file could not be uploaded - try again',
          href,
        },
      ],
      uploadValidationError: { text: 'The selected file could not be uploaded - try again' },
    };

    // Act
    const response = getUploadErrors(req, res);

    // Assert
    expect(response).toEqual(expectedResponse);
  });

  it('returns filename validation error if it fails', () => {
    // Arrange
    const { res, req } = httpMocks.createMocks<GetUploadErrorsRequest, GetUploadErrorsResponse>(
      {
        file: { originalname: 'filename' },
        session: { utilisationReport: { reportPeriod: 'Report Period' } },
      },
      {},
    );

    jest.mocked(validateFilenameFormat).mockReturnValueOnce({ filenameError: 'Error' });

    const expectedResponse = {
      uploadErrorSummary: [
        {
          text: 'Error',
          href,
        },
      ],
      uploadValidationError: { text: 'Error' },
    };

    // Act
    const response = getUploadErrors(req, res);

    // Assert
    expect(response).toEqual(expectedResponse);
  });

  it('returns null if no upload errors', () => {
    // Arrange
    const { res, req } = httpMocks.createMocks<GetUploadErrorsRequest, GetUploadErrorsResponse>(
      {
        file: { originalname: 'filename' },
        session: { utilisationReport: { reportPeriod: 'Report Period' } },
      },
      {},
    );

    jest.mocked(validateFilenameFormat).mockReturnValueOnce({
      filenameError: undefined,
    });

    // Act
    const response = getUploadErrors(req, res);

    // Assert
    expect(response).toEqual(null);
  });
});
