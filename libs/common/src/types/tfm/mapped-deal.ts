import { ObjectId } from 'mongodb';
import { DEAL_TYPE } from '../../constants';
import { AnyObject } from '../any-object';
import { DealSubmissionType, DealType, TfmActivity, TfmDealCancellationWithStatus } from '..';
import { TfmDealStage } from './deal-stage';
import { MappedBssEwcsFacilitySnapshot, MappedGefFacilitySnapshot } from './mapped-facility';

/**
 * In TFM we map deals from the database to take on a different structure which is then passed around TFM-UI and TFM-API.
 * these types are incomplete and should be added to as and when new properties are discovered
 */

type MappedBaseDealSnapshot = AnyObject & {
  _id: ObjectId;
  submissionType: DealSubmissionType;
  isFinanceIncreasing: boolean;
  details: {
    ukefDealId: string;
  };
  totals: AnyObject;
  submissionDetails: AnyObject;
  eligibility: AnyObject;
};

export interface MappedBssEwcsDealSnapshot extends MappedBaseDealSnapshot {
  dealType: typeof DEAL_TYPE.BSS_EWCS;
  facilities: MappedBssEwcsFacilitySnapshot[];
}

export interface MappedGefDealSnapshot extends MappedBaseDealSnapshot {
  dealType: typeof DEAL_TYPE.GEF;
  facilities: MappedGefFacilitySnapshot[];
  status: string;
  updatedAt: number;
  maker: AnyObject;
  bank: AnyObject;
  exporter: {
    companyName: string;
  };
  bankInternalRefName: string;
  additionalRefName: string;
  supportingInformation: {
    status: string;
  };
}

export type MappedDealSnapshot = MappedBssEwcsDealSnapshot | MappedGefDealSnapshot;

export type MappedDealTfm = {
  supplyContractValueInGBP: string | null;
  dateReceived: string;
  dateReceivedTimestamp: number;
  product: DealType;
  stage: TfmDealStage;
  exporterCreditRating: string;
  lastUpdated: number;
  lossGivenDefault: number;
  probabilityOfDefault: number;
  activities: TfmActivity[];
  parties: AnyObject;
  cancellation?: TfmDealCancellationWithStatus;
  tasks?: AnyObject[];
};

export type MappedDeal = {
  _id: ObjectId;
  dealSnapshot: MappedDealSnapshot;
  tfm: MappedDealTfm;
};
