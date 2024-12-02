import { ObjectId } from 'mongodb';
import { MAPPED_FACILITY_TYPE } from '../../constants';
import { AnyObject } from '../any-object';
import { TfmFacilityStage } from './facility-stage';
import { Currency } from '../currency';

/**
 * In TFM we map facilities from the database to take on a different structure which is then passed around TFM-UI and TFM-API.
 * these types are incomplete and should be added to as and when new properties are discovered
 */

type FacilityEndDateProperties =
  | {
      isUsingFacilityEndDate: true;
      facilityEndDate?: Date | null;
    }
  | {
      isUsingFacilityEndDate: false;
      bankReviewDate?: Date | null;
    }
  | {
      isUsingFacilityEndDate?: null;
    };

type MappedBaseFacilitySnapshot = AnyObject & {
  _id: ObjectId;
  ukefFacilityId: string;
  dealId: ObjectId;
  hasBeenIssued: boolean;
  ukefFacilityType: string;
  facilityStage: TfmFacilityStage;
  facilityProduct: {
    code: string;
    name: string;
  };
  bankFacilityReference: string;
  banksInterestMargin: string;
  currency: Currency;
  coveredPercentage: string;
  dayCountBasis: number;
  facilityValueExportCurrency: string;
  value: string;
  ukefExposure: string;
  guaranteeFeePayableToUkef: string;
  feeType: string;
  feeFrequency: string;
};

export interface MappedBssEwcsFacilitySnapshot extends MappedBaseFacilitySnapshot {
  isGef: false;
  type: string;
  dates: {
    inclusionNoticeReceived?: string | number;
    bankIssueNoticedReceived?: string | number;
    tenor?: string;
    coverStartDate?: number;
    coverEndDate?: string;
  };
  firstDrawdownAmountInExportCurrency: string | null;
  bondIssuer: string;
  bondBeneficiary: string;
}

export interface MappedGefFacilitySnapshot extends MappedBaseFacilitySnapshot {
  isGef: true;
  type: typeof MAPPED_FACILITY_TYPE.CASH | typeof MAPPED_FACILITY_TYPE.CONTINGENT;
  dates: FacilityEndDateProperties & {
    inclusionNoticeReceived?: string | number;
    bankIssueNoticedReceived?: string | number;
    tenor: string;
    coverStartDate?: number;
    coverEndDate?: string;
  };
  providedOnOther: string;
  providedOn: string[];
}

export type MappedFacilitySnapshot = MappedBssEwcsFacilitySnapshot | MappedGefFacilitySnapshot;

export type MappedFacilityTfm = {
  hasBeenIssuedAndAcknowledged: boolean;
  feeRecord: number;
  ukefExposureCalculationTimestamp: string;
  expourePeriodInMonths: number;
  facilityGuaranteeDates: {
    guaranteeCommencementDate: string;
    guaranteeExpiryDate: string;
    effectiveDate: string;
  };
  riskProfile: string;
  ukefExposure: {
    exposure?: string;
    timestamp?: string;
  };
  premiumSchedule: AnyObject;
  premiumTotals: string | number;
  creditRating: string;
};

export type MappedFacility = {
  _id: ObjectId;
  facilitySnapshot: MappedFacilitySnapshot;
  tfm: MappedFacilityTfm;
};
