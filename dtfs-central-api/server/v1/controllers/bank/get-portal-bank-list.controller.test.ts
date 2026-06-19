import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiErrorResponseBody, type PortalBankListEntry } from '@ukef/dtfs2-common';
import { TestApiError } from '@ukef/dtfs2-common/test-helpers';
import { WithId } from 'mongodb';
import { getPortalBankList } from './get-portal-bank-list.controller';
import { getAllPortalBankListEntries } from '../../../repositories/portal-bank-list-repo';
import { aBank } from '../../../../test-helpers';

jest.mock('../../../repositories/portal-bank-list-repo');

type MockResponse = Partial<Response<WithId<PortalBankListEntry>[] | ApiErrorResponseBody>> & {
  status: jest.Mock;
  send: jest.Mock;
};

const getMockResponse = (): MockResponse => {
  const res: MockResponse = {
    status: jest.fn(),
    send: jest.fn(),
  };
  res.status.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
};

/**
 * Invokes the controller under test with a minimal request object and the
 * supplied mock response.
 *
 * This keeps each test focused on arranging repository behaviour and asserting
 * the response shape rather than repeating Express wiring.
 */
const invokeController = async (res: MockResponse) => {
  const req = {} as Parameters<typeof getPortalBankList>[0];
  await getPortalBankList(req, res as Response<WithId<PortalBankListEntry>[] | ApiErrorResponseBody>);
};

describe('getPortalBankList', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('when the database returns a list of entries', () => {
    const entries: WithId<PortalBankListEntry>[] = [
      { ...aBank(), name: 'Bank 1', order: 1 },
      { ...aBank(), name: 'Bank 2', order: 2 },
    ];

    beforeEach(() => {
      jest.mocked(getAllPortalBankListEntries).mockResolvedValue(entries);
    });

    it(`should respond with a ${HttpStatusCode.Ok}`, async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Ok);
    });

    it('should respond with the list of entries returned by the database', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenNthCalledWith(1, entries);
    });
  });

  describe('when the database returns an empty list', () => {
    beforeEach(() => {
      jest.mocked(getAllPortalBankListEntries).mockResolvedValue([]);
    });

    it(`should respond with a ${HttpStatusCode.Ok} and an empty array`, async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(res.send).toHaveBeenCalledWith([]);
    });
  });

  describe('when the database throws an ApiError', () => {
    const apiError = new TestApiError({
      status: HttpStatusCode.BadRequest,
      message: 'Something is wrong with the request',
      code: 'INVALID_PAYLOAD',
    });

    beforeEach(() => {
      jest.mocked(getAllPortalBankListEntries).mockRejectedValue(apiError);
    });

    it('should respond with the status from the ApiError', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    });

    it('should respond with an error body', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        status: HttpStatusCode.BadRequest,
        message: `Failed to get the portal bank list: ${apiError.message}`,
        code: apiError.code,
      });
    });

    it('should call console.error', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('%s %o', 'Failed to get the portal bank list', apiError);
    });
  });

  describe('when the database throws a non-ApiError', () => {
    const unknownError = new Error('Database unreachable');

    beforeEach(() => {
      jest.mocked(getAllPortalBankListEntries).mockRejectedValue(unknownError);
    });

    it('should respond with a 500', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error body', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        status: HttpStatusCode.InternalServerError,
        message: 'Failed to get the portal bank list',
      });
    });

    it('should call console.error', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('%s %o', 'Failed to get the portal bank list', unknownError);
    });
  });
});
