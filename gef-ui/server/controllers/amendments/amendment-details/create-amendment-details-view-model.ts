import { PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
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
 * @returns amendment details view model
 */
export const createAmendmentDetailsViewModel = ({
  amendment,
  deal,
  facility,
  userRoles,
}: {
  amendment: PortalFacilityAmendmentWithUkefId;
  deal: Deal;
  facility: Facility;
  userRoles: string[];
}): AmendmentDetailsViewModel => ({
  userRoles,
  exporterName: deal.exporter.companyName,
  facilityType: facility.type,
  previousPage: `/gef/application-details/${deal._id}`,
  amendmentSummaryListParams: mapAmendmentToAmendmentSummaryListParams(amendment, false),
});
