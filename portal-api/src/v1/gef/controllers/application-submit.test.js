import { HttpStatusCode } from 'axios';
import { number } from '../../../external-api/api';
import { generateId, generateUkefId } from './application-submit';

const body = {
  entityType: 'deal',
  dealId: '1234',
};

const mockSuccessfulResponse = {
  data: {
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
  },
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

describe('generateUkefId', () => {
  beforeEach(() => {
    number.get = jest.fn().mockResolvedValue(mockSuccessfulResponse);
  });

  it('should generate a maskedId when a valid application is provided for deal entity type', async () => {
    const result = await generateUkefId('deal', { _id: '12345' });

    expect(result.maskedId).toEqual('0010000000');
    expect(result).toEqual(mockSuccessfulResponse.data.data[0]);
  });

  it('should generate a maskedId when a valid application is provided for facility entity type', async () => {
    const result = await generateUkefId('facility', { dealId: '12345' });

    expect(result.maskedId).toEqual('0010000000');
    expect(result).toEqual(mockSuccessfulResponse.data.data[0]);
  });

  it('Should throw an error when an invalid entity and deal id are provided', async () => {
    await expect(generateUkefId('invalid', undefined)).rejects.toThrow('Unable to generate id');
  });

  it('Should throw an error when an invalid deal id is provided', async () => {
    await expect(generateUkefId('deal', undefined)).rejects.toThrow('Unable to generate id');
  });

  it('Should throw an error when an application is provided', async () => {
    await expect(generateUkefId('deal', null)).rejects.toThrow('Unable to generate id');
  });

  it('Should throw an error when an application is provided', async () => {
    await expect(generateUkefId('deal', {})).rejects.toThrow('Unable to generate id');
  });
});
