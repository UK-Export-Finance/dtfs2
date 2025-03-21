import { format, fromUnixTime } from 'date-fns';
import { PortalFacilityAmendmentWithUkefId, DATE_FORMATS, PortalSessionUser } from '@ukef/dtfs2-common';
import { getCurrencySymbol } from '../facility-value/get-currency-symbol';
import { Deal } from '../../../types/deal';
import { Facility } from '../../../types/facility';

/**
 * maps emailVariables to an email on amendment submission to checker
 * consumes deal, facility, amendment and user and maps to relevant format
 * @param deal
 * @param facility
 * @param amendment
 * @param user
 * @returns mapped email variables
 */
const mapSubmittedToCheckerEmailVariables = ({
  deal,
  facility,
  amendment,
  user,
  checker,
}: {
  deal: Deal;
  facility: Facility;
  amendment: PortalFacilityAmendmentWithUkefId;
  user: PortalSessionUser;
  checker: PortalSessionUser;
}) => {
  const {
    ukefDealId,
    bankInternalRefName,
    exporter: { companyName: exporterName },
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

  const makersName = `${user.firstname} ${user.surname}`;
  const makersEmail = user.email;

  const checkersName = `${checker.firstname} ${checker.surname}`;
  const checkersEmail = checker.email;

  const dateSubmittedByMaker = format(new Date(), DATE_FORMATS.DD_MMMM_YYYY);

  const portalUrl = 'https://www.google.com';

  return {
    ukefDealId,
    bankInternalRefName,
    exporterName,
    ukefFacilityId,
    formattedEffectiveDate,
    formattedCoverEndDate,
    formattedFacilityEndDate,
    formattedFacilityValue,
    makersName,
    makersEmail,
    dateSubmittedByMaker,
    checkersName,
    checkersEmail,
    portalUrl,
  };
};

export default mapSubmittedToCheckerEmailVariables;
