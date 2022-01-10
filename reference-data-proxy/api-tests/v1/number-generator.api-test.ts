import axios from 'axios';
import { app } from '../../src/createApp';
const { post } = require('../api')(app);
import { addDurableFunctionLog } from '../../src/v1/controllers/durable-functions-log.controller';

const mockId = '0030007215';

const mockResponses = {
  numberGeneratorFunction: {
    status: 202,
    data: {
      id: '7b7475ca5c984a808cb56abdc9b75a61',
      statusQueryGetUri:
        'http://localhost:7072/runtime/webhooks/durabletask/instances/7b7475ca5c984a808cb56abdc9b75a61?taskHub=numbergenerator&connection=Storage&code=Xm80X2xSRGxNKd9YtLYDBkynz49/knUL5lI/7KauDj0/duawyQb06A==',
      sendEventPostUri:
        'http://localhost:7072/runtime/webhooks/durabletask/instances/7b7475ca5c984a808cb56abdc9b75a61/raiseEvent/{eventName}?taskHub=numbergenerator&connection=Storage&code=Xm80X2xSRGxNKd9YtLYDBkynz49/knUL5lI/7KauDj0/duawyQb06A==',
      terminatePostUri:
        'http://localhost:7072/runtime/webhooks/durabletask/instances/7b7475ca5c984a808cb56abdc9b75a61/terminate?reason={text}&taskHub=numbergenerator&connection=Storage&code=Xm80X2xSRGxNKd9YtLYDBkynz49/knUL5lI/7KauDj0/duawyQb06A==',
      rewindPostUri:
        'http://localhost:7072/runtime/webhooks/durabletask/instances/7b7475ca5c984a808cb56abdc9b75a61/rewind?reason={text}&taskHub=numbergenerator&connection=Storage&code=Xm80X2xSRGxNKd9YtLYDBkynz49/knUL5lI/7KauDj0/duawyQb06A==',
      purgeHistoryDeleteUri:
        'http://localhost:7072/runtime/webhooks/durabletask/instances/7b7475ca5c984a808cb56abdc9b75a61?taskHub=numbergenerator&connection=Storage&code=Xm80X2xSRGxNKd9YtLYDBkynz49/knUL5lI/7KauDj0/duawyQb06A==',
    },
  },
  numberGenerator: {
    status: 201,
    data: {
      id: 20018971,
      maskedId: mockId,
      numberTypeId: 1,
      createdBy: 'Portal v2/TFM',
      createdDatetime: '2020-12-16T15:12:28.13Z',
      requestingSystem: 'Portal v2/TFM',
    },
  },
  acbs: {
    status: 404,
    data: {
      id: mockId,
    },
  },
};

jest.mock('../../src/v1/controllers/durable-functions-log.controller');

jest.mock('axios', () =>
  jest.fn((args: any) => {
    const { method, url } = args;

    if (method === 'post') {
      if (url.startsWith(process.env.AZURE_NUMBER_GENERATOR_FUNCTION_URL)) {
        return Promise.resolve(mockResponses.numberGeneratorFunction);
      }
    }

    if (method === 'get') {
      if (url === `${process.env.MULESOFT_API_ACBS_DEAL_URL}/${mockId}`) {
        return Promise.resolve(mockResponses.acbs);
      }
    }

    if (method === 'get') {
      if (url === `${process.env.MULESOFT_API_ACBS_FACILITY_URL}/${mockId}`) {
        return Promise.resolve(mockResponses.acbs);
      }
    }
  }),
);

const mockNumGenParams = {
  dealId: 111,
  dealType: 'dealType',
  entityId: 222,
  entityType: 'deal',
  user: { id: 'userId' },
};

describe('/number-generator', () => {
  describe('Trigger Number Generator Function', () => {
    it('should return status error and log error if unsuccessful', async () => {
      const apiError = {
        toJSON: () => ({
          msg: 'mockApi Error',
        }),
      };
      (axios as unknown as jest.Mock).mockImplementation(() => Promise.resolve({ status: 404, err: apiError }));
      const { status } = await post(mockNumGenParams).to('/number-generator');
      expect(status).toEqual(404);

      const logCallParams = {
        data: {
          ...mockNumGenParams,
          error: apiError.toJSON(),
        },
        type: 'NUMBER_GENERATOR',
      };

      expect(addDurableFunctionLog).toHaveBeenCalledWith(logCallParams);
    });
  });
});
