import { ObjectId } from 'mongodb';
import escapeStringRegexp from 'escape-string-regexp';
import { Request, Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import CONSTANTS from '../../../../constants';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

export const getFacilitiesByDealId = async (req: Request, res: Response) => {
  const { id: dealId } = req.params;

  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  // NOTE: only GEF facilities have dealId.
  // this could be adapted so that we get the deal, check dealType,
  // then search for either dealId or dealId.
  const facilities = await TfmFacilitiesRepo.findByDealId(dealId);

  return res.status(200).send(facilities);
};

type GetAllFacilitiesRequest = CustomExpressRequest<{
  query: {
    searchString?: string;
    sortBy?: {
      order: string;
      field: string;
    };
    pagesize?: string;
    page?: string;
  };
}>;

export const getAllFacilities = async (req: GetAllFacilitiesRequest, res: Response) => {
  const { searchString, sortBy, pagesize, page = 0 } = req.query;

  const pageNumber = Number(page);
  const pagesizeNumber = pagesize ? parseInt(pagesize, 10) : 0;

  const fieldsToSortOn: Record<string, number> = {};
  if (sortBy) {
    fieldsToSortOn[sortBy.field] = sortBy.order === CONSTANTS.FACILITIES.SORT_BY.ASCENDING ? 1 : -1;
  }
  if (sortBy?.field !== 'ukefFacilityId') {
    fieldsToSortOn.ukefFacilityId = 1;
  }

  const searchStringEscaped = escapeStringRegexp(searchString || '');

  /**
   * mongodb query that returns an array of objects with the following format:
   * [{
   *    "amendments": [amendments-array]
   *     "tfmFacilities": {
   *        "dealId": "Mock deal Id",
   *        "facilityId": "Mock facility Id",
   *        "ukefFacilityId": "0030136443",
   *        "dealType": "GEF",
   *        "type": "Cash",
   *        "value": 1000000,
   *        "currency": "GBP",
   *        "coverEndDate": "2021-08-12T00:00:00.000Z",.
   *        "companyName": "Mock company name",
   *        "hasBeenIssued": true
   *     }
   * }]
   */
  const allFacilitiesAndCount = await TfmFacilitiesRepo.findAllFacilitiesAndFacilityCount({
    searchStringEscaped,
    fieldsToSortOn,
    page: pageNumber,
    pagesize: pagesizeNumber,
  });

  if (!allFacilitiesAndCount) {
    const pagination = {
      totalItems: 0,
      currentPage: pageNumber,
      totalPages: 1,
    };
    return res.status(200).send({ facilities: [], pagination });
  }

  const { facilities, count } = allFacilitiesAndCount;

  const pagination = {
    totalItems: count,
    currentPage: pageNumber,
    totalPages: pagesize ? Math.ceil(count / pagesizeNumber) : 1,
  };

  if (facilities) {
    return res.status(200).send({ facilities, pagination });
  }

  return res.status(404).send();
};
