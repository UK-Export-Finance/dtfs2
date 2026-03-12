import { ObjectId } from 'mongodb';
import { DEAL_TYPE } from '../../constants';
import { AnyObject } from '../any-object';
import { DealSubmissionType } from '..';
import { PortalActivity } from '../portal';

type BaseDeal = AnyObject & {
  _id: ObjectId;
  submissionType: DealSubmissionType | null;
};

type BaseBank = {
  companiesHouseNo: string;
  _id: ObjectId;
  id: string;
  emails: string[];
  mga: string[];
  name: string;
  partyUrn: string;
};

type BssEwcsDealDetailsBankPaymentOfficerTeam = {
  emails: string[];
  teamName: string;
};

type BssEwcsUtilisationReportPeriodSchedule = {
  startMonth: number;
  endMonth: number;
};

interface BssEwcsDealDetailsBank extends BaseBank {
  hasGefAccessOnly: boolean;
  isVisibleInTfmUtilisationReports: boolean;
  paymentOfficerTeam: BssEwcsDealDetailsBankPaymentOfficerTeam;
  utilisationReportPeriodSchedule: BssEwcsUtilisationReportPeriodSchedule[];
}

export interface BssEwcsDeal extends BaseDeal {
  dealType: typeof DEAL_TYPE.BSS_EWCS;
  details: {
    ukefDealId: string;
    submissionCount: number;
    bank: BssEwcsDealDetailsBank;
  };
}

export interface GefDeal extends BaseDeal {
  bank: BaseBank;
  dealType: typeof DEAL_TYPE.GEF;
  eligibility: AnyObject;
  exporter: AnyObject;
  portalActivities: PortalActivity[];
  submissionCount: number;
  ukefDealId: string | null;
}

/**
 * Type of the mongo db "deal" collection
 *
 * This type is incomplete and should be added
 * to as and when new properties are discovered
 */
export type Deal = BssEwcsDeal | GefDeal;
