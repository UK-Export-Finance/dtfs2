import { PortalFacilityAmendmentWithUkefId, ROLES, DATE_FORMATS, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { format, fromUnixTime } from 'date-fns';
import { AmendmentDetailsViewModel } from '../../../types/view-models/amendments/amendment-details-view-model';
import { Deal } from '../../../types/deal';
import { Facility } from '../../../types/facility';
import { mapAmendmentToAmendmentSummaryListParams } from '../helpers/amendment-summary-view-model.helper';

/**
 * Create the amendment details page view model
 * returns amendment details view model including backlink url
 * @param createCheckYourAnswersViewModelParams
 * @param createCheckYourAnswersViewModelParams.amendment - the amendment
 * @param createCheckYourAnswersViewModelParams.deal - the deal
 * @param createCheckYourAnswersViewModelParams.facility - the facility
 * @param createCheckYourAnswersViewModelParams.userRoles - the user roles
 * @returns amendment details view model
 */
export const createAmendmentDetailsViewModel = ({
  amendment,
  deal,
  facility,
  userRoles,
  banner,
}: {
  amendment: PortalFacilityAmendmentWithUkefId;
  deal: Deal;
  facility: Facility;
  userRoles: string[];
  banner?: boolean;
}): AmendmentDetailsViewModel => ({
  userRoles,
  exporterName: deal.exporter.companyName,
  facilityType: facility.type,
  submitAmendment: userRoles.includes(ROLES.CHECKER),
  dealId: deal._id,
  facilityId: facility._id,
  amendmentId: amendment.amendmentId,
  effectiveDate: amendment.effectiveDate ? format(fromUnixTime(amendment.effectiveDate), DATE_FORMATS.D_MMMM_YYYY) : '',
  banner,
  canSubmitFacilityAmendment: userRoles.includes('maker') && amendment.status === PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
  previousPage: `/gef/application-details/${deal._id}`,
  amendmentSummaryListParams: mapAmendmentToAmendmentSummaryListParams(amendment, facility, false),
});
