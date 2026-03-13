import { ObjectId } from 'mongodb';
import { DEAL_TYPE } from '../../constants';
import { AnyObject } from '../any-object';
import { Bank, DealSubmissionType } from '..';
import { PortalActivity } from '../portal';

type BaseDeal = AnyObject & {
  _id: ObjectId;
  submissionType: DealSubmissionType | null;
};

type CodeNamePair = {
  code: string;
  name: string;
};

type OptionalCodeNamePair = Partial<CodeNamePair>;

type SupplyContractCurrency = {
  text: string;
  id: string;
  currencyId?: number;
};

export interface BssEwcsSubmissionDetails {
  status: string;
  'supplier-type': string;
  'supplier-companies-house-registration-number': string;
  'supplier-name': string;
  'supplier-address-country': CodeNamePair;
  'supplier-address-line-1': string;
  'supplier-address-line-2': string;
  'supplier-address-line-3': string;
  'supplier-address-town': string;
  'supplier-address-postcode': string;
  'supplier-correspondence-address-is-different': string;
  'supplier-correspondence-address-country': OptionalCodeNamePair;
  'supplier-correspondence-address-line-1': string;
  'supplier-correspondence-address-line-2': string;
  'supplier-correspondence-address-line-3': string;
  'supplier-correspondence-address-town': string;
  'supplier-correspondence-address-postcode': string;
  'industry-sector': CodeNamePair;
  'industry-class': CodeNamePair;
  'sme-type': string;
  'supply-contract-description': string;
  legallyDistinct: string;
  'indemnifier-companies-house-registration-number': string;
  'indemnifier-name': string;
  'indemnifier-address-country': OptionalCodeNamePair;
  'indemnifier-address-line-1': string;
  'indemnifier-address-line-2': string;
  'indemnifier-address-line-3': string;
  'indemnifier-address-town': string;
  'indemnifier-address-postcode': string;
  'indemnifier-correspondence-address-country': OptionalCodeNamePair;
  'indemnifier-correspondence-address-line-1': string;
  'indemnifier-correspondence-address-line-2': string;
  'indemnifier-correspondence-address-line-3': string;
  'indemnifier-correspondence-address-town': string;
  'indemnifier-correspondence-address-postcode': string;
  indemnifierCorrespondenceAddressDifferent: string;
  'buyer-name': string;
  'buyer-address-country': CodeNamePair;
  'buyer-address-line-1': string;
  'buyer-address-line-2': string;
  'buyer-address-line-3': string;
  'buyer-address-town': string;
  'buyer-address-postcode': string;
  destinationOfGoodsAndServices: CodeNamePair;
  supplyContractValue: string;
  supplyContractCurrency: SupplyContractCurrency;
  viewedPreviewPage: boolean;
  'supplyContractConversionDate-day'?: string;
  'supplyContractConversionDate-month'?: string;
  'supplyContractConversionDate-year'?: string;
  supplyContractConversionRateToGBP?: string;
}

export interface BssEwcsDeal extends BaseDeal {
  bank: Bank;
  dealType: typeof DEAL_TYPE.BSS_EWCS;
  details: {
    ukefDealId: string;
    submissionCount: number;
  };
  submissionDetails: BssEwcsSubmissionDetails;
}

export interface GefDeal extends BaseDeal {
  bank: Bank;
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
