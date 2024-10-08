import { HttpStatusCode } from 'axios';
import { estoreInternalServerError } from './estore-internal-server-error';

describe('estoreInternalServerError', () => {
  it('should return an object with status and message properties', () => {
    const message = 'Mock error';
    const result = estoreInternalServerError(message);

    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('status');
    expect(result.data).toHaveProperty('message');
  });

  it('should set the status property to 500', () => {
    const message = 'Mock error';
    const result = estoreInternalServerError(message);

    expect(result.status).toBe(HttpStatusCode.InternalServerError);
  });

  it('should set the data.status property to 500', () => {
    const message = 'Mock error';
    const result = estoreInternalServerError(message);

    expect(result.data.status).toBe(HttpStatusCode.InternalServerError);
  });

  it('should return an object with an empty string as the message property', () => {
    const message = '';
    const result = estoreInternalServerError(message);

    expect(result.data.message).toStrictEqual('');
  });

  it('should return an object with an empty object as the message property', () => {
    const message = {};
    const result = estoreInternalServerError(message);

    expect(result.data.message).toStrictEqual({});
  });

  it('should return an object with an multidimensional properties as the message property', () => {
    const message = {
      country: {
        name: 'UK',
        code: 'GB',
        county: {
          name: 'London',
          borough: {
            name: 'Westminster',
            park: {
              name: 'Hyde Park',
              ponds: {
                name: 'Serpentine',
                wildlife: {
                  name: 'Swans',
                },
              },
            },
          },
        },
      },
    };
    const result = estoreInternalServerError(message);

    expect(result.data.message).toStrictEqual(message);
  });

  it('should return entire message', () => {
    const error = 'a';
    const longMessage = error.repeat(5001);
    const result = estoreInternalServerError(longMessage);

    expect(result.data.message).toStrictEqual(longMessage);
  });
});
