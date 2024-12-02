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
  /**
   * This null is due to existing patterns of mappers returning null if there is no matching mapping.
   */
  ukefFacilityId: string | null;
  dealId: ObjectId;
  hasBeenIssued: boolean;
  ukefFacilityType: string;
  facilityStage: TfmFacilityStage;
  /**
   * This undefined is due to existing patterns of mappers returning an unassigned variable if there is no matching mapping.
   */
  facilityProduct:
    | {
        code: string;
        name: string;
      }
    | undefined;
  bankFacilityReference: string;
  banksInterestMargin: string;
  currency: Currency;
  coveredPercentage: string;
  dayCountBasis: number;
  /**
   * This null is due to existing patterns of mappers returning null if there is no matching mapping.
   */
  facilityValueExportCurrency: string | null;
  value: string;
  /**
   * This undefined is due to existing patterns of mappers returning an unassigned variable if there is no matching mapping.
   */
  ukefExposure: string | undefined;
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
  /**
   * This null is due to existing patterns of mappers returning null if there is no matching mapping.
   */
  type: typeof MAPPED_FACILITY_TYPE.CASH | typeof MAPPED_FACILITY_TYPE.CONTINGENT | null;
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

export type MappedGefFacility = {
  _id: ObjectId;
  facilitySnapshot: MappedGefFacilitySnapshot;
  tfm: MappedFacilityTfm;
};

export type MappedBssEwcsFacility = {
  _id: ObjectId;
  facilitySnapshot: MappedGefFacilitySnapshot;
  tfm: MappedFacilityTfm;
};

export type MappedFacility = MappedGefFacility | MappedBssEwcsFacility;
