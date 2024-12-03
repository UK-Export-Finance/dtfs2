import { HttpStatusCode } from 'axios';
import { number } from '../../../external-api/api';
import { generateId, generateUkefId } from './application-submit';
import { NUMBER } from '../../../constants';

const body = {
  entityType: NUMBER.ENTITY_TYPE.DEAL,
  dealId: '1234',
};

const mockSuccessfulResponse = {
  data: {
    status: 200,
    data: [
      {
        id: 12345678,
        maskedId: NUMBER.UKEF_ID.TEST,
        type: 1,
        createdBy: NUMBER.USER.DTFS,
        createdDatetime: '2024-01-01T00:00:00.000Z',
        requestingSystem: NUMBER.USER.DTFS,
      },
    ],
  },
};

const mockUnsuccessfulResponse = {
  status: 500,
  error: {
    response: {
      data: {
        status: 400,
        error: {
          name: 'Error',
          message: 'INVALID_ENTITY_TYPE',
          cause: 'Invalid entity type: invalid',
        },
      },
    },
  },
};

describe('generateId', () => {
  it('Should throw an error when an invalid argument is provided', async () => {
    const result = await generateId(null, null);

    expect(result.status).toEqual(HttpStatusCode.InternalServerError);
    expect(result.error).toEqual(Error('Invalid argument provided for null'));
  });

  it('Should throw an error when an invalid deal id is provided', async () => {
    const result = await generateId(body.entityType, null);

    expect(result.status).toEqual(HttpStatusCode.InternalServerError);
    expect(result.error).toEqual(Error('Invalid argument provided for null'));
  });

  it('Should throw an error when an invalid entity type is provided', async () => {
    const result = await generateId(null, body.dealId);

    expect(result.status).toEqual(HttpStatusCode.InternalServerError);
    expect(result.error).toEqual(Error('Invalid argument provided for 1234'));
  });

  it('Should throw a internal server error when an invalid entity type is specified', async () => {
    number.getNumber = jest.fn().mockResolvedValue(mockUnsuccessfulResponse);
    const result = await generateId('invalid', body.dealId);
    const { status, error } = result;
    const { response: externalApi } = error;

    expect(status).toEqual(HttpStatusCode.InternalServerError);
    expect(externalApi.data.status).toEqual(HttpStatusCode.BadRequest);
    expect(externalApi.data.error.message).toEqual('INVALID_ENTITY_TYPE');
  });

  it('Should call number generator', async () => {
    number.getNumber = jest.fn().mockResolvedValue(mockSuccessfulResponse);
    const result = await generateId(body.entityType, body.dealId);

    expect(result).toEqual(mockSuccessfulResponse);
  });
});

describe('generateUkefId', () => {
  beforeEach(() => {
    number.getNumber = jest.fn().mockResolvedValue(mockSuccessfulResponse);
  });

  it('should generate a maskedId when a valid application is provided for deal entity type', async () => {
    const result = await generateUkefId(NUMBER.ENTITY_TYPE.DEAL, { _id: '12345' });

    expect(result.maskedId).toEqual(NUMBER.UKEF_ID.TEST);
    expect(result).toEqual(mockSuccessfulResponse.data.data[0]);
  });

  it('should generate a maskedId when a valid application is provided for facility entity type', async () => {
    const result = await generateUkefId(NUMBER.ENTITY_TYPE.FACILITY, { dealId: '12345' });

    expect(result.maskedId).toEqual(NUMBER.UKEF_ID.TEST);
    expect(result).toEqual(mockSuccessfulResponse.data.data[0]);
  });

  it('Should throw an error when an invalid entity and deal id are provided', async () => {
    await expect(generateUkefId('invalid', undefined)).rejects.toThrow('Unable to generate id');
  });

  it('Should throw an error when an invalid deal id is provided', async () => {
    await expect(generateUkefId(NUMBER.ENTITY_TYPE.DEAL, undefined)).rejects.toThrow('Unable to generate id');
  });

  it('Should throw an error when an application is provided', async () => {
    await expect(generateUkefId(NUMBER.ENTITY_TYPE.DEAL, null)).rejects.toThrow('Unable to generate id');
  });

  it('Should throw an error when an application is provided', async () => {
    await expect(generateUkefId(NUMBER.ENTITY_TYPE.DEAL, {})).rejects.toThrow('Unable to generate id');
  });
});
