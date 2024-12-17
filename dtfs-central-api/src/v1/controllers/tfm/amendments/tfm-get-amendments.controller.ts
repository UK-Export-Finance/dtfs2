import { ObjectId, Document } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { Currency, AMENDMENT_STATUS, AMENDMENT_QUERIES, ApiError, API_ERROR_CODE, FacilityAmendment } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import { AMENDMENT_QUERY_STATUSES } from '../../../../constants';

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

export const getAllAmendmentsInProgress = async (_req: Request, res: Response) => {
  try {
    const inProgressAmendments = await TfmFacilitiesRepo.findAmendmentsByStatus(AMENDMENT_STATUS.IN_PROGRESS);
    return res.status(HttpStatusCode.Ok).send(inProgressAmendments);
  } catch (error) {
    console.error('Error getting all in progress amendments:', error);
    return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'Failed to get' });
  }
};

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

export const getAmendmentsByFacilityId = async (req: Request, res: Response) => {
  const { facilityId, amendmentIdOrStatus, type } = req.params;

  try {
    let amendment: Document | Document[] | null;
    switch (amendmentIdOrStatus) {
      case AMENDMENT_QUERY_STATUSES.IN_PROGRESS: {
        amendment = (await TfmFacilitiesRepo.findAmendmentsByFacilityIdAndStatus(facilityId, AMENDMENT_STATUS.IN_PROGRESS)).at(0) ?? {};
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
          amendment = await TfmFacilitiesRepo.findAmendmentsByFacilityIdAndStatus(facilityId, AMENDMENT_STATUS.COMPLETED);
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
      message: 'An unknown error occurred when getting amendments by facility id',
    });
  }
};

export const getAmendmentsByDealId = async (req: Request, res: Response) => {
  const { dealId, status, type } = req.params;

  try {
    let amendment: Document | Document[] | null;
    switch (status) {
      case AMENDMENT_QUERY_STATUSES.IN_PROGRESS:
        amendment = await TfmFacilitiesRepo.findAmendmentsByDealIdAndStatus(dealId, AMENDMENT_STATUS.IN_PROGRESS);
        break;
      case AMENDMENT_QUERY_STATUSES.COMPLETED:
        if (type === AMENDMENT_QUERIES.LATEST) {
          const latestAmendment = await TfmFacilitiesRepo.findLatestCompletedAmendmentByDealId(dealId);
          amendment = latestAmendment ? mapAmendmentToLatestValue(latestAmendment) : {};
        } else {
          amendment = await TfmFacilitiesRepo.findAmendmentsByDealIdAndStatus(dealId, AMENDMENT_STATUS.COMPLETED);
        }
        break;
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
      message: 'An unknown error occurred when getting amendments by facility id',
    });
  }
};
