import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, ApiErrorResponseBody, type PortalBankListEntry } from '@ukef/dtfs2-common';
import { WithId, ObjectId } from 'mongodb';
import { getPortalBankList } from './get-portal-bank-list.controller';
import { getAllPortalBankListEntries } from '../../../repositories/portal-bank-list-repo';

jest.mock('../../../repositories/portal-bank-list-repo');

class TestApiError extends ApiError {
  constructor({ status, message, code }: { status: number; message: string; code?: ApiError['code'] }) {
    super({ status, message, code });
  }
}

const aPortalBankListEntry = (overrides: Partial<WithId<PortalBankListEntry>> = {}): WithId<PortalBankListEntry> => ({
  _id: new ObjectId(),
  name: 'Bank 1',
  order: 1,
  ...overrides,
});

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

  describe('when the repository returns a list of entries', () => {
    const entries: WithId<PortalBankListEntry>[] = [aPortalBankListEntry({ name: 'Bank 1', order: 1 }), aPortalBankListEntry({ name: 'Bank 2', order: 2 })];

    beforeEach(() => {
      jest.mocked(getAllPortalBankListEntries).mockResolvedValue(entries);
    });

    it('should respond with a 200 (Ok)', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    });

    it('should respond with the list of entries returned by the repository', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith(entries);
    });
  });

  describe('when the repository returns an empty list', () => {
    beforeEach(() => {
      jest.mocked(getAllPortalBankListEntries).mockResolvedValue([]);
    });

    it('should respond with a 200 (Ok) and an empty array', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(res.send).toHaveBeenCalledWith([]);
    });
  });

  describe('when the repository throws an ApiError', () => {
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

    it('should respond with an error body that wraps the ApiError message and code', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        status: HttpStatusCode.BadRequest,
        message: `Failed to get the portal bank list: ${apiError.message}`,
        code: apiError.code,
      });
    });

    it('should log the error to console.error', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('%s %o', 'Failed to get the portal bank list', apiError);
    });
  });

  describe('when the repository throws a non-ApiError', () => {
    const unknownError = new Error('Database unreachable');

    beforeEach(() => {
      jest.mocked(getAllPortalBankListEntries).mockRejectedValue(unknownError);
    });

    it('should respond with a 500 (Internal Server Error)', async () => {
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

    it('should log the error to console.error', async () => {
      const res = getMockResponse();

      await invokeController(res);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('%s %o', 'Failed to get the portal bank list', unknownError);
    });
  });
});
