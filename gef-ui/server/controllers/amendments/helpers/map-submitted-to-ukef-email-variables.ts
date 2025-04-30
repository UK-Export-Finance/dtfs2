import { format, fromUnixTime } from 'date-fns';
import dotenv from 'dotenv';
import { PortalFacilityAmendmentWithUkefId, DATE_FORMATS, PortalSessionUser, generateAmendmentMandatoryCriteria } from '@ukef/dtfs2-common';
import { getCurrencySymbol } from '../facility-value/get-currency-symbol';
import { Deal } from '../../../types/deal';
import { Facility } from '../../../types/facility';

dotenv.config();

/**
 * maps emailVariables to an email on amendment submission to checker
 * consumes deal, facility, amendment and user and maps to relevant format
 * @param deal
 * @param facility
 * @param amendment
 * @param user
 * @param referenceNumber
 * @returns mapped email variables
 */
const mapSubmittedToUkefEmailVariables = ({
  deal,
  facility,
  amendment,
  user,
  referenceNumber,
}: {
  deal: Deal;
  facility: Facility;
  amendment: PortalFacilityAmendmentWithUkefId;
  user: PortalSessionUser;
  referenceNumber: string;
}) => {
  const {
    ukefDealId,
    bankInternalRefName,
    exporter: { companyName: exporterName },
    maker,
  } = deal;

  const { ukefFacilityId } = facility;

  const { effectiveDate, changeFacilityValue, changeCoverEndDate, coverEndDate, value, isUsingFacilityEndDate, facilityEndDate } = amendment;

  // if effective date is defined, format it from unix timestamp (without ms) to DD MMMM YYYY, otherwise set it to '-'
  const formattedEffectiveDate = effectiveDate ? format(fromUnixTime(effectiveDate), DATE_FORMATS.DD_MMMM_YYYY) : '-';
  // if changeCoverEndDate is true and coverEndDate is defined, format it to DD MMMM YYYY, otherwise set it to '-'
  const formattedCoverEndDate = changeCoverEndDate && coverEndDate ? format(coverEndDate, DATE_FORMATS.DD_MMMM_YYYY) : '-';
  // if isUsingFacilityEndDate is true and facilityEndDate is defined, format it to DD MMMM YYYY, otherwise set it to '-'
  const formattedFacilityEndDate = isUsingFacilityEndDate && facilityEndDate ? format(new Date(facilityEndDate), DATE_FORMATS.DD_MMMM_YYYY) : '-';

  // default formattedFacilityValue
  let formattedFacilityValue = '-';

  /**
   * if changeFacilityValue is true and value is defined
   * get the currency symbol from the facility currency id
   * and set formattedFacilityValue to currency symbol + value
   */
  if (changeFacilityValue && value) {
    let currencySymbol = '';

    if (facility?.currency?.id) {
      currencySymbol = getCurrencySymbol(facility?.currency.id);
    }

    formattedFacilityValue = `${currencySymbol}${value}`;
  }

  const criteria = amendment.eligibilityCriteria?.criteria || [];
  const formattedEligibilityCriteria = generateAmendmentMandatoryCriteria(criteria);

  const makersName = `${String(maker.firstname)} ${String(maker.surname)}`;
  const makersEmail = String(maker.email);

  const checkersName = `${user.firstname} ${user.surname}`;
  const checkersEmail = user.email;

  const makersBank = maker.bank;
  const bankName = makersBank ? (makersBank as { name: string }).name : '-';

  return {
    makersEmail,
    checkersEmail,
    emailVariables: {
      ukefDealId,
      bankInternalRefName: bankInternalRefName!,
      exporterName,
      ukefFacilityId: ukefFacilityId!,
      dateEffectiveFrom: formattedEffectiveDate,
      newCoverEndDate: formattedCoverEndDate,
      newFacilityEndDate: formattedFacilityEndDate,
      newFacilityValue: formattedFacilityValue,
      makersName,
      makersEmail,
      checkersName,
      bankName,
      eligibilityCriteria: formattedEligibilityCriteria,
      referenceNumber,
    },
  };
};

export default mapSubmittedToUkefEmailVariables;
