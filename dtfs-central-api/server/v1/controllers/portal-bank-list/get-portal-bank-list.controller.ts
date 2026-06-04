import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { CustomExpressRequest, ApiError, ApiErrorResponseBody } from '@ukef/dtfs2-common';
import { getAllPortalBankListEntries } from '../../../repositories/portal-bank-list-repo';

type GetPortalBankListRequest = CustomExpressRequest<object>;

/**
 * Express handler for `GET /v1/portal-bank-list`.
 *
 * Returns every entry in the `portal-bank-list` MongoDB collection, sorted by
 * `order` ascending then `name` ascending, so the response can be rendered
 * directly on the portal homepage without further sorting.
 *
 * Error mapping:
 * - Any thrown `ApiError` is propagated using its own `status` and `code`, with
 *   the message prefixed by "Failed to get the portal bank list".
 * - Any other error is logged and returned as a `500 Internal Server Error`
 *   with a generic message — the underlying error is not exposed to callers.
 */
export const getPortalBankList = async (req: GetPortalBankListRequest, res: Response<unknown[] | ApiErrorResponseBody>) => {
  try {
    const entries = await getAllPortalBankListEntries();
    return res.status(HttpStatusCode.Ok).send(entries);
  } catch (error) {
    const errorMessage = 'Failed to get the portal bank list';
    console.error('%s %o', errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send({
        status: error.status,
        message: `${errorMessage}: ${error.message}`,
        code: error.code,
      });
    }
    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: errorMessage,
    });
  }
};
