const httpFunction = require('../../src/functions/acbs-http');
const { UKEF_ID } = require('../../constants/deal');

describe('acbs-http', () => {
  let request;
  let client;

  beforeEach(() => {
    request = {
      url: 'mock',
      method: 'POST',
      params: {
        orchestratorName: 'acbs-http-mock',
      },
      json: () =>
        jest.fn().mockResolvedValue({
          deal: {},
          bank: {},
        }),
    };

    client = {
      startNew: jest.fn().mockResolvedValue('123'),
      createCheckStatusResponse: jest.fn().mockResolvedValue({ status: UKEF_ID.PENDING }),
    };

    console.info = jest.fn();
  });

  it('should log the invocation with the correct URL and method', async () => {
    // Act
    await httpFunction(request, client);

    // Assert
    expect(console.info).toHaveBeenLastCalledWith('⚡️ Invoking ACBS DOF using HTTP trigger at %s with HTTP %s method.', request.url, request.method);
  });

  it('should call client imperative function once', async () => {
    // Act
    await httpFunction(request, client);

    // Assert
    expect(client.startNew).toHaveBeenCalledTimes(1);
    expect(client.createCheckStatusResponse).toHaveBeenCalledTimes(1);

    expect(client.startNew).toHaveBeenCalledWith(request.params.orchestratorName, expect.any(Object));
    expect(client.createCheckStatusResponse).toHaveBeenCalledWith(request, expect.any(String));
  });

  it('should return response from calling HTTP trigger function', async () => {
    // Act
    const result = await httpFunction(request, client);

    // Assert
    expect(result).toStrictEqual({ status: UKEF_ID.PENDING });
  });
});
