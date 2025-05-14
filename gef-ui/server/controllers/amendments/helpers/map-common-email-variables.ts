import { format, fromUnixTime } from 'date-fns';
import { PortalFacilityAmendmentWithUkefId, DATE_FORMATS } from '@ukef/dtfs2-common';
import { getCurrencySymbol } from '../facility-value/get-currency-symbol';
import { Deal } from '../../../types/deal';
import { Facility } from '../../../types/facility';

/**
 * maps common emailVariables to an email on amendment submission to checker and ukef
 * consumes deal, facility, amendment user and checker and maps to relevant format
 * @param deal
 * @param facility
 * @param amendment
 * @param user
 * @param checker
 * @returns mapped common email variables
 */
export const mapCommonEmailVariables = ({ deal, facility, amendment }: { deal: Deal; facility: Facility; amendment: PortalFacilityAmendmentWithUkefId }) => {
  const {
    ukefDealId,
    bankInternalRefName,
    exporter: { companyName: exporterName },
  } = deal;

  const { ukefFacilityId } = facility;

  const { effectiveDate, changeFacilityValue, changeCoverEndDate, coverEndDate, value, isUsingFacilityEndDate, facilityEndDate } = amendment;

  const formattedEffectiveDate = effectiveDate ? format(fromUnixTime(effectiveDate), DATE_FORMATS.DD_MMMM_YYYY) : '-';
  const formattedCoverEndDate = changeCoverEndDate && coverEndDate ? format(coverEndDate, DATE_FORMATS.DD_MMMM_YYYY) : '-';
  const formattedFacilityEndDate = isUsingFacilityEndDate && facilityEndDate ? format(new Date(facilityEndDate), DATE_FORMATS.DD_MMMM_YYYY) : '-';

  let formattedFacilityValue = '-';
  if (changeFacilityValue && value) {
    const currencySymbol = facility?.currency?.id ? getCurrencySymbol(facility.currency.id) : '';
    formattedFacilityValue = `${currencySymbol}${value}`;
  }

  return {
    ukefDealId,
    bankInternalRefName: bankInternalRefName!,
    exporterName,
    ukefFacilityId: ukefFacilityId!,
    dateEffectiveFrom: formattedEffectiveDate,
    newCoverEndDate: formattedCoverEndDate,
    newFacilityEndDate: formattedFacilityEndDate,
    newFacilityValue: formattedFacilityValue,
  };
};
