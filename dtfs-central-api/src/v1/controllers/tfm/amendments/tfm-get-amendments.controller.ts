import { ObjectId, Document } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { Currency } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo, TfmFacilityAmendment } from '../../../../repositories/tfm-facilities-repo';
import { AMENDMENT_QUERIES, AMENDMENT_QUERY_STATUSES, AMENDMENT_STATUS } from '../../../../constants';

export const getAllAmendmentsInProgress = async (req: Request, res: Response) => {
  try {
    const inProgressAmendments = await TfmFacilitiesRepo.findAmendmentsByStatus(AMENDMENT_STATUS.IN_PROGRESS);
    return res.status(HttpStatusCode.Ok).send(inProgressAmendments);
  } catch (error) {
    return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'Failed to get' });
  }
};

const mapAmendmentToLatestValue = (
  amendment: TfmFacilityAmendment,
): {
  amendmentId: string;
  value: number;
  currency: Currency;
} => {
  const { amendmentId, value, currency } = amendment;
  if (!amendmentId) {
    throw new Error('Found amendment does not have a defined amendmentId');
  }
  if (!value) {
    throw new Error('Found amendment does not have a defined value');
  }
  if (!currency) {
    throw new Error('Found amendment does not have a defined currency');
  }
  return { amendmentId: amendmentId.toString(), value, currency };
};

const mapAmendmentToLatestCompletedDate = (
  amendment: TfmFacilityAmendment,
): {
  amendmentId: string;
  coverEndDate: number;
} => {
  const { amendmentId, coverEndDate } = amendment;
  if (!amendmentId) {
    throw new Error('Found amendment does not have a defined amendmentId');
  }
  if (!coverEndDate) {
    throw new Error('Found amendment does not have a defined coverEndDate');
  }
  return {
    amendmentId: amendmentId.toString(),
    coverEndDate,
  };
};

export const getAmendmentsByFacilityId = async (req: Request, res: Response) => {
  const { facilityId, amendmentIdOrStatus, type } = req.params;

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
      } else {
        amendment = await TfmFacilitiesRepo.findAmendmentsByFacilityIdAndStatus(facilityId, AMENDMENT_STATUS.COMPLETED);
      }
      break;
    default:
      if (amendmentIdOrStatus) {
        if (!ObjectId.isValid(amendmentIdOrStatus)) {
          return res.status(400).send({ status: 400, message: 'Invalid amendment Id' });
        }
        amendment = (await TfmFacilitiesRepo.findAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentIdOrStatus)) ?? {};
      } else {
        amendment = await TfmFacilitiesRepo.findAmendmentsByFacilityId(facilityId);
      }
  }
  return res.status(200).send(amendment);
};

export const getAmendmentsByDealId = async (req: Request, res: Response) => {
  const { dealId, status, type } = req.params;

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
  return res.status(200).send(amendment);
};
