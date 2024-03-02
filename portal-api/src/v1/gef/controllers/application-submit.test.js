import { HttpStatusCode } from 'axios';
import { number } from '../../../external-api/api';
import { generateId, generateUkefDealId, generateUkefFacilityId } from './application-submit';

const body = {
  entityType: 'deal',
  dealId: '1234',
};

const mockSuccessfulResponse = {
  status: 200,
  data: [
    {
      id: 12345678,
      maskedId: '0010000000',
      type: 1,
      createdBy: 'Portal v2/TFM',
      createdDatetime: '2024-01-01T00:00:00.000Z',
      requestingSystem: 'Portal v2/TFM',
    },
  ],
};

describe('generateId', () => {
  it('Should throw an error when an invalid argument is provided', async () => {
    const result = await generateId(null, null);

    expect(result.status).toEqual(HttpStatusCode.InternalServerError);
    expect(result.error).toEqual(Error('Void argument provided for null'));
  });

  it('Should throw an error when an invalid deal id is provided', async () => {
    const result = await generateId(body.entityType, null);

    expect(result.status).toEqual(HttpStatusCode.InternalServerError);
    expect(result.error).toEqual(Error('Void argument provided for null'));
  });

  it('Should throw an error when an invalid entity type is provided', async () => {
    const result = await generateId(null, body.dealId);

    expect(result.status).toEqual(HttpStatusCode.InternalServerError);
    expect(result.error).toEqual(Error('Void argument provided for 1234'));
  });

  it('Should throw a internal server error when an invalid entity type is specified', async () => {
    const result = await generateId('invalid', body.dealId);
    const { status, error } = result;
    const { response: externalApi } = error;

    expect(status).toEqual(HttpStatusCode.InternalServerError);
    expect(externalApi.data.status).toEqual(HttpStatusCode.BadRequest);
    expect(externalApi.data.error.message).toEqual('INVALID_ENTITY_TYPE');
  });

  it('Should call number generator', async () => {
    number.get = jest.fn().mockResolvedValue(mockSuccessfulResponse);
    const result = await generateId(body.entityType, body.dealId);

    expect(result).toEqual(mockSuccessfulResponse);
  });
});

describe('generateUkefDealId', () => {
  beforeEach(() => {
    number.get = jest.fn().mockResolvedValue(mockSuccessfulResponse);
  });

  it('should generate a maskedId when a valid application is provided', async () => {
    const application = { _id: '12345' };

    const result = await generateUkefDealId(application);
    expect(result).toEqual(mockSuccessfulResponse.data);
  });

  it('Should throw an error when an invalid deal id is provided', async () => {
    const application = undefined;

    await expect(generateUkefDealId(application)).rejects.toThrow('Unable to generate deal id');
  });

  it('Should throw an error when an application is provided', async () => {
    const application = null;

    await expect(generateUkefDealId(application)).rejects.toThrow('Unable to generate deal id');
  });

  it('Should throw an error when an application is provided', async () => {
    const application = {};

    await expect(generateUkefDealId(application)).rejects.toThrow('Unable to generate deal id');
  });
});

describe('generateUkefFacilityId', () => {
  beforeEach(() => {
    number.get = jest.fn().mockResolvedValue(mockSuccessfulResponse);
  });

  it('should generate a maskedId when a valid application is provided', async () => {
    const application = { dealId: '12345' };

    const result = await generateUkefFacilityId(application);
    expect(result).toEqual(mockSuccessfulResponse.data);
  });

  it('Should throw an error when an invalid deal id is provided', async () => {
    const application = undefined;

    await expect(generateUkefFacilityId(application)).rejects.toThrow('Unable to generate facility id');
  });

  it('Should throw an error when an application is provided', async () => {
    const application = null;

    await expect(generateUkefFacilityId(application)).rejects.toThrow('Unable to generate facility id');
  });

  it('Should throw an error when an application is provided', async () => {
    const application = {};

    await expect(generateUkefFacilityId(application)).rejects.toThrow('Unable to generate facility id');
  });
});
