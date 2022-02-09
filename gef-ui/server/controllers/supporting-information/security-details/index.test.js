import {
  getSecurityDetails,
  postSecurityDetails,
  MAX_INPUT_LENGTH,
} from '.';
import Application from '../../../models/application';
import { updateApplication } from '../../../services/api';

jest.mock('../../../models/application');
jest.mock('../../../services/api', () => ({
  updateApplication: jest.fn(),
}));

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.sendStatus = jest.fn();
  res.render = jest.fn();
  return res;
};

describe('controllers/supporting-information/security-details', () => {
  const mockResponse = MockResponse();
  let mockRequest;

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('getSecurityDetails', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          dealId: 'mock-id',
        },
        session: {
          user: { roles: ['MAKER'] },
        },
      };
    });

    it('renders submission page as expected', async () => {
      Application.findById.mockResolvedValue({ supportingInformation: {} });

      await getSecurityDetails(mockRequest, mockResponse);

      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('partials/security-details.njk', {
        dealId: 'mock-id',
        inputMaxLength: MAX_INPUT_LENGTH,
      });
    });

    it('renders submission existing values if present', async () => {
      Application.findById.mockResolvedValue({
        supportingInformation: {
          securityDetails: {
            facility: 'mock applications security details',
            exporter: 'mock exporter security details',
          },
        },
      });

      await getSecurityDetails(mockRequest, mockResponse);

      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('partials/security-details.njk', {
        dealId: 'mock-id',
        inputMaxLength: MAX_INPUT_LENGTH,
        facilitySecurity: 'mock applications security details',
        exporterSecurity: 'mock exporter security details',
      });
    });

    it('returns 404 if user not authorised to access resource', async () => {
      Application.findById.mockResolvedValue(null);

      await getSecurityDetails(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(404);
    });

    it('returns next if there is an API error', async () => {
      Application.findById.mockRejectedValue('some error');

      await getSecurityDetails(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('postSecurityDetails', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          dealId: 'mock-id',
        },
        session: {
          user: { roles: ['MAKER'] },
        },
        body: {
          exporterSecurity: 'mock exporter security',
          facilitySecurity: 'mock application security',
        },
      };
    });

    it('renders the page showing error if inputs not set', async () => {
      mockRequest.body = {};

      await postSecurityDetails(mockRequest, mockResponse);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('partials/security-details.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([
            { href: '#exporterSecurity', text: expect.any(String) },
            { href: '#facilitySecurity', text: expect.any(String) },
          ]),
        }),
        dealId: 'mock-id',
        inputMaxLength: MAX_INPUT_LENGTH,
      }));
    });

    it('renders the page showing error if inputs are too long', async () => {
      const longString = new Array(MAX_INPUT_LENGTH + 10).join('s');

      mockRequest.body = {
        exporterSecurity: longString,
        facilitySecurity: longString,
      };

      await postSecurityDetails(mockRequest, mockResponse);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('partials/security-details.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([
            { href: '#exporterSecurity', text: expect.any(String) },
            { href: '#facilitySecurity', text: expect.any(String) },
          ]),
        }),
        exporterSecurity: longString,
        facilitySecurity: longString,
      }));
    });

    it('renders the page showing error if input has invalid contentg', async () => {
      const invalidString = 'This @ is < invalid *';

      mockRequest.body = {
        exporterSecurity: invalidString,
        facilitySecurity: invalidString,
      };

      await postSecurityDetails(mockRequest, mockResponse);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('partials/security-details.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([
            { href: '#exporterSecurity', text: expect.any(String) },
            { href: '#facilitySecurity', text: expect.any(String) },
          ]),
        }),
        exporterSecurity: invalidString,
        facilitySecurity: invalidString,
      }));
    });

    it('returns 404 if user not authorised to access resource', async () => {
      Application.findById.mockResolvedValue(null);

      await postSecurityDetails(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(404);
    });

    it('returns 500 status if error getting or updating application', async () => {
      Application.findById.mockResolvedValue({ supportingInformation: {} });
      updateApplication.mockRejectedValue('some error');

      await postSecurityDetails(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(500);
    });

    it('updates application and redirects to next question if valid data', async () => {
      Application.findById.mockResolvedValue({ supportingInformation: {} });
      updateApplication.mockResolvedValue({ id: 'mock-id' });

      await postSecurityDetails(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith(expect.any(String));
    });
  });
});
