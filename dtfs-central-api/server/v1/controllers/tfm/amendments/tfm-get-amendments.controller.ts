import { ObjectId, Document } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import {
  Currency,
  TFM_AMENDMENT_STATUS,
  AMENDMENT_QUERIES,
  ApiError,
  API_ERROR_CODE,
  FacilityAmendment,
  PORTAL_AMENDMENT_STATUS,
  AMENDMENT_QUERY_STATUSES,
} from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

type CompletedFacilityEndDate =
  | {
      amendmentId: string;
      isUsingFacilityEndDate: true;
      facilityEndDate: Date;
    }
  | {
      amendmentId: string;
      isUsingFacilityEndDate: false;
      bankReviewDate: Date;
    }
  | { amendmentId: string; isUsingFacilityEndDate: undefined };

/**
 * Returns all TFM amendments currently in progress across all facilities.
 *
 * This endpoint is used by operational views that need a global queue of
 * in-flight amendments.
 * @param {Request} _req - Express request (unused).
 * @param {Response} res - Express response used to send the amendment list or an error payload.
 * @returns {Promise<Response>} HTTP 200 with in-progress amendments, or HTTP 500 on failure.
 */
export const getAllAmendmentsInProgress = async (_req: Request, res: Response) => {
  try {
    const inProgressAmendments = await TfmFacilitiesRepo.findTfmAmendmentsByStatus(TFM_AMENDMENT_STATUS.IN_PROGRESS);
    return res.status(HttpStatusCode.Ok).send(inProgressAmendments);
  } catch (error) {
    console.error('Error getting all in progress amendments:', error);
    return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'Failed to get' });
  }
};

/**
 * Maps a completed amendment to its latest monetary value shape.
 *
 * Throws when required fields are missing so the controller can return
 * an internal error instead of silently returning incomplete data.
 * @param {FacilityAmendment} amendment - Completed amendment document to map.
 * @returns {{ amendmentId: string; value: number; currency: Currency }} Latest value projection.
 * @throws {Error} When `value` or `currency` is missing.
 */
const mapAmendmentToLatestValue = (
  amendment: FacilityAmendment,
): {
  amendmentId: string;
  value: number;
  currency: Currency;
} => {
  const { amendmentId, value, currency } = amendment;
  if (!value) {
    throw new Error('Found amendment does not have a defined value');
  }

  if (!currency) {
    throw new Error('Found amendment does not have a defined currency');
  }

  return { amendmentId: amendmentId.toString(), value, currency };
};

/**
 * Maps a completed amendment to its latest cover end date shape.
 *
 * Throws when `coverEndDate` is not defined on the amendment.
 * @param {FacilityAmendment} amendment - Completed amendment document to map.
 * @returns {{ amendmentId: string; coverEndDate: number }} Latest cover end date projection.
 * @throws {Error} When `coverEndDate` is missing.
 */
const mapAmendmentToLatestCompletedDate = (
  amendment: FacilityAmendment,
): {
  amendmentId: string;
  coverEndDate: number;
} => {
  const { amendmentId, coverEndDate } = amendment;
  if (!coverEndDate) {
    throw new Error('Found amendment does not have a defined coverEndDate');
  }

  return {
    amendmentId: amendmentId.toString(),
    coverEndDate,
  };
};

/**
 * Maps a completed amendment to facility-end-date specific values.
 *
 * - `isUsingFacilityEndDate: true`  => returns `facilityEndDate`
 * - `isUsingFacilityEndDate: false` => returns `bankReviewDate`
 * - unset/legacy                    => returns only the flag as `undefined`
 * @param {FacilityAmendment} amendment - Completed amendment document to map.
 * @returns {CompletedFacilityEndDate} Facility end date projection for completed amendments.
 * @throws {Error} When the selected end-date field is missing for the chosen mode.
 */
const mapAmendmentToFacilityEndDateValues = (amendment: FacilityAmendment): CompletedFacilityEndDate => {
  const { amendmentId, isUsingFacilityEndDate, facilityEndDate, bankReviewDate } = amendment;
  if (isUsingFacilityEndDate) {
    if (!facilityEndDate) {
      throw new Error('Found amendment does not have a defined facility end date');
    }
    return {
      amendmentId: amendmentId.toString(),
      isUsingFacilityEndDate,
      facilityEndDate,
    };
  }

  if (isUsingFacilityEndDate === false) {
    if (!bankReviewDate) {
      throw new Error('Found amendment does not have a defined bank review date');
    }

    return {
      amendmentId: amendmentId.toString(),
      isUsingFacilityEndDate,
      bankReviewDate,
    };
  }

  return {
    amendmentId: amendmentId.toString(),
    isUsingFacilityEndDate: undefined,
  };
};

/**
 * Returns amendments for a facility, with support for filtered/status routes.
 *
 * Supported `amendmentIdOrStatus` values:
 * - `in-progress`: single in-progress amendment (or `{}` when none exists)
 * - `completed`: completed list, or latest projection when `type` is provided
 * - Mongo amendment id: a specific amendment document (or `{}` when not found)
 * - undefined: all amendments for the facility
 *
 * Supported `type` values when status is `completed`:
 * - `latest-value`
 * - `latest-cover-end-date`
 * - `latest-facility-end-date`
 * @param {Request} req - Express request containing `facilityId`, `amendmentIdOrStatus`, and optional `type` route params.
 * @param {Response} res - Express response used to send amendment payloads or error details.
 * @returns {Promise<Response>} HTTP 200 with amendment result(s), HTTP 400 for invalid amendment id, or error status on failure.
 */
export const getAmendmentsByFacilityId = async (req: Request, res: Response) => {
  const { facilityId, amendmentIdOrStatus, type } = req.params;

  try {
    let amendment: Document | Document[] | null;
    switch (amendmentIdOrStatus) {
      case AMENDMENT_QUERY_STATUSES.IN_PROGRESS: {
        amendment = (await TfmFacilitiesRepo.findTfmAmendmentsByFacilityIdAndStatus(facilityId, TFM_AMENDMENT_STATUS.IN_PROGRESS)).at(0) ?? {};
        break;
      }
      case AMENDMENT_QUERY_STATUSES.COMPLETED:
        if (type === AMENDMENT_QUERIES.LATEST_VALUE) {
          const latestAmendment = await TfmFacilitiesRepo.findLatestCompletedAmendmentByFacilityId(facilityId);
          amendment = latestAmendment ? mapAmendmentToLatestValue(latestAmendment) : {};
        } else if (type === AMENDMENT_QUERIES.LATEST_COVER_END_DATE) {
          const latestAmendment = await TfmFacilitiesRepo.findLatestCompletedAmendmentByFacilityId(facilityId);
          amendment = latestAmendment ? mapAmendmentToLatestCompletedDate(latestAmendment) : {};
        } else if (type === AMENDMENT_QUERIES.LATEST_FACILITY_END_DATE) {
          const latestAmendment = await TfmFacilitiesRepo.findLatestCompletedAmendmentByFacilityId(facilityId);
          amendment = latestAmendment ? mapAmendmentToFacilityEndDateValues(latestAmendment) : {};
        } else {
          amendment = await TfmFacilitiesRepo.findTfmAmendmentsByFacilityIdAndStatus(facilityId, TFM_AMENDMENT_STATUS.COMPLETED);
        }
        break;
      default:
        if (amendmentIdOrStatus) {
          if (!ObjectId.isValid(amendmentIdOrStatus)) {
            return res.status(400).send({ status: 400, message: 'Invalid amendment Id', code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER });
          }
          amendment = (await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentIdOrStatus)) ?? {};
        } else {
          amendment = await TfmFacilitiesRepo.findAmendmentsByFacilityId(facilityId);
        }
    }

    return res.status(HttpStatusCode.Ok).send(amendment);
  } catch (error) {
    console.error('Error getting amendments by facility id:', error);
    if (error instanceof ApiError) {
      const { status, message } = error;
      return res.status(status).send({ status, message });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'getAmendmentsByFacilityId - An unknown error occurred when getting amendments by facility id',
    });
  }
};

/**
 * Returns amendments for a deal, with support for status and latest filters.
 *
 * Supported `status` values:
 * - `in-progress`: in-progress TFM amendments
 * - `completed`: completed TFM amendments (or latest when `type=latest`)
 * - `approved`: merged approved set across portal + TFM amendment statuses
 * - undefined: all amendments for the deal
 * @param {Request} req - Express request containing `dealId`, optional `status`, and optional `type` route params.
 * @param {Response} res - Express response used to send amendment payloads or error details.
 * @returns {Promise<Response>} HTTP 200 with amendment result(s), or error status on failure.
 */
export const getAmendmentsByDealId = async (req: Request, res: Response) => {
  const { dealId, status, type } = req.params;

  try {
    let amendment: Document | Document[] | null;
    switch (status) {
      case AMENDMENT_QUERY_STATUSES.IN_PROGRESS:
        amendment = await TfmFacilitiesRepo.findTfmAmendmentsByDealIdAndStatus(dealId, TFM_AMENDMENT_STATUS.IN_PROGRESS);
        break;
      case AMENDMENT_QUERY_STATUSES.COMPLETED:
        if (type === AMENDMENT_QUERIES.LATEST) {
          const latestAmendment = await TfmFacilitiesRepo.findLatestCompletedAmendmentByDealId(dealId);
          amendment = latestAmendment ? mapAmendmentToLatestValue(latestAmendment) : {};
        } else {
          amendment = await TfmFacilitiesRepo.findTfmAmendmentsByDealIdAndStatus(dealId, TFM_AMENDMENT_STATUS.COMPLETED);
        }
        break;
      case AMENDMENT_QUERY_STATUSES.APPROVED: {
        const statuses = [PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED, TFM_AMENDMENT_STATUS.COMPLETED];

        amendment = await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({
          dealId,
          statuses,
        });
        break;
      }
      default:
        amendment = await TfmFacilitiesRepo.findAmendmentsByDealId(dealId);
    }
    return res.status(HttpStatusCode.Ok).send(amendment);
  } catch (error) {
    console.error('Error getting amendments by deal id:', error);

    if (error instanceof ApiError) {
      const { status: errorStatus, message } = error;
      return res.status(errorStatus).send({ status: errorStatus, message });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'getAmendmentsByDealId - An unknown error occurred when getting amendments by deal id',
    });
  }
};
