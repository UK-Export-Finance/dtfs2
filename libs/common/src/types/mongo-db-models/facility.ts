import { ObjectId } from 'mongodb';
import { UnixTimestamp, UnixTimestampString } from '../date';
import { Currency } from '../currency';
import { AuditDatabaseRecord } from '../audit-database-record';
import { FacilityStatus } from '../portal';
import { AnyObject } from '../any-object';
import { FACILITY_TYPE, GEF_FACILITY_TYPE } from '../../constants';
import { TfmFacilityStage } from '../tfm';

/**
 * These properties will not exist if on a BSS/EWCS deal or the deal version is less than 1
 */
type FacilityEndDateProperties =
  | {
      isUsingFacilityEndDate: true;
      facilityEndDate?: Date | null;
      bankReviewDate?: null;
    }
  | {
      isUsingFacilityEndDate: false;
      facilityEndDate?: null;
      bankReviewDate?: Date | null;
    }
  | {
      isUsingFacilityEndDate?: null;
      facilityEndDate?: null;
      bankReviewDate?: null;
    };

type BaseFacility = AnyObject & {
  _id: ObjectId;
  dealId: ObjectId;
  hasBeenIssued: boolean;
  name: string;
  shouldCoverStartOnSubmission: boolean;
  coverStartDate: UnixTimestampString | Date | null;
  coverEndDate: UnixTimestampString | Date | null;
  issueDate: UnixTimestampString | Date | null;
  monthsOfCover: number | null;
  details: string[];
  detailsOther: string;
  currency: {
    id: Currency;
  };
  value: number;
  coverPercentage: number;
  interestPercentage: number;
  paymentType: string;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  ukefExposure: number;
  guaranteeFee: number;
  submittedAsIssuedDate: UnixTimestampString | null;
  ukefFacilityId: string | null;
  feeType: string;
  feeFrequency: string;
  dayCountBasis: number;
  coverDateConfirmed: boolean | null;
  hasBeenIssuedAndAcknowledged: boolean | null;
  canResubmitIssuedFacilities: boolean | null;
  unissuedToIssuedByMaker?: object;
  auditRecord?: AuditDatabaseRecord;
  facilityStage?: TfmFacilityStage;
};

export type GefFacility = BaseFacility &
  FacilityEndDateProperties & {
    type: typeof GEF_FACILITY_TYPE;
    // Legacy data from migrating old GEF Facilities into DTFS
    dataMigration?: {
      drupalFacilityId: string;
    };
  };

export interface BondFacility extends BaseFacility {
  type: typeof FACILITY_TYPE.BOND;
  status?: FacilityStatus;
  previousStatus?: string;
  bondType?: string;
}

export interface LoanFacility extends BaseFacility {
  type: typeof FACILITY_TYPE.LOAN;
  status?: FacilityStatus;
  previousStatus?: string;
}

export type BssEwcsFacility = LoanFacility | BondFacility;

/**
 * Type of the mongo db "facilities" collection
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type Facility = GefFacility | BssEwcsFacility;
