const { HttpStatusCode } = require('axios');

const mockExternalApiEmail = jest.fn(() => Promise.resolve({}));

jest.mock('../../../src/external-api/api', () => ({
  sendEmail: mockExternalApiEmail,
}));

const sendEmail = require('./index');

describe('sendEmail', () => {
  const templateId = 'aTemplateId';
  const emailAddress = 'aEmail@aDomain.com';
  const emailVariables = { firstName: 'aFirstName', signInLink: 'aLink' };

  let originalConsoleError;

  beforeEach(() => {
    jest.resetAllMocks();
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('calls the sendEmail method on the externalApi with the correct arguments', async () => {
    mockExternalApiEmail.mockImplementation(() => Promise.resolve({}));

    await sendEmail(templateId, emailAddress, emailVariables);

    expect(mockExternalApiEmail).toHaveBeenCalledWith(templateId, emailAddress, emailVariables);
  });

  it('returns the response from the sendEmail method call on the external api, if it is successful', async () => {
    const externalApiSendEmailResponse = { status: HttpStatusCode.Created };

    mockExternalApiEmail.mockImplementation(() => Promise.resolve(externalApiSendEmailResponse));

    const response = await sendEmail(templateId, emailAddress, emailVariables);

    expect(response).toEqual(externalApiSendEmailResponse);
  });

  it('returns an object with a HttpStatusCode.InternalServerError status code if the sendEmail method call on the externalApi fails and the error object has a different status code', async () => {
    const error = { response: { status: HttpStatusCode.BadRequest } };
    const expectedResponse = { status: HttpStatusCode.InternalServerError, data: 'Failed to send an email' };

    mockExternalApiEmail.mockImplementation(() => Promise.reject(error));

    const response = await sendEmail(templateId, emailAddress, emailVariables);

    expect(response).toEqual(expectedResponse);
  });

  it('returns an object with a HttpStatusCode.InternalServerError status code if the sendEmail method call on the externalApi fails and the error object has no status code', async () => {
    const error = {};
    const expectedResponse = { status: HttpStatusCode.InternalServerError, data: 'Failed to send an email' };

    mockExternalApiEmail.mockImplementation(() => Promise.reject(error));

    const response = await sendEmail(templateId, emailAddress, emailVariables);

    expect(response).toEqual(expectedResponse);
  });

  it('prints an error to the console including the data from the error object from the sendEmail method call on the externalApi, if it fails', async () => {
    const someArray = ['some data', 'some more data'];
    const error = { response: { data: someArray } };

    mockExternalApiEmail.mockImplementation(() => Promise.reject(error));

    await sendEmail(templateId, emailAddress, emailVariables);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Portal API - Failed to send email %o', error?.response?.data);
  });

  it('prints an error to the console if the sendEmail method call on the externalApi fails and the error object has no data', async () => {
    const error = {};

    mockExternalApiEmail.mockImplementation(() => Promise.reject(error));

    await sendEmail(templateId, emailAddress, emailVariables);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Portal API - Failed to send email %o', undefined);
  });

  it('returns error if parameter templateId is missing', async () => {
    const response = await sendEmail(null, emailAddress, emailVariables);

    expect(response).toStrictEqual({ status: HttpStatusCode.BadRequest, data: 'Missing parameter templateId' });
  });

  it('returns error if parameter emailAddress is missing', async () => {
    const response = await sendEmail(templateId, null, emailVariables);

    expect(response).toStrictEqual({ status: HttpStatusCode.BadRequest, data: 'Missing parameter sendToEmailAddress' });
  });

  it('returns error if parameter emailVariables is missing', async () => {
    const response = await sendEmail(templateId, emailAddress, null);

    expect(response).toStrictEqual({ status: HttpStatusCode.BadRequest, data: 'Missing parameter emailVariables' });
  });
});
