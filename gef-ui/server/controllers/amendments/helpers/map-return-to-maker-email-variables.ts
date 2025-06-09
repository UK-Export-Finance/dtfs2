import dotenv from 'dotenv';
import { PortalFacilityAmendmentWithUkefId, PortalSessionUser } from '@ukef/dtfs2-common';
import { mapCommonEmailVariables } from './map-common-email-variables';
import { Deal } from '../../../types/deal';
import { Facility } from '../../../types/facility';

dotenv.config();

/**
 * Maps email variables for a GovNotify email when an amendment is returned to the maker.
 * Consumes deal, facility, amendment and user data and maps to relevant email variables.
 * @param deal
 * @param facility
 * @param amendment
 * @param user
 * @returns mapped email variables
 */
const mapReturnToMakerEmailVariables = ({
  deal,
  facility,
  amendment,
  user,
}: {
  deal: Deal | null;
  facility: Facility | null;
  amendment: PortalFacilityAmendmentWithUkefId | null;
  user: PortalSessionUser | null;
}) => {
  // Check if any of the required parameters are null
  if (!deal || !facility || !amendment || !user) {
    throw new Error('Deal, Facility, Amendment or User is null');
  }

  const commonVariables = mapCommonEmailVariables({ deal, facility, amendment });

  const makersName = `${String(deal.maker.firstname)} ${String(deal.maker.surname)}`;
  const makersEmail = String(deal.maker.email);

  const checkersName = `${user.firstname} ${user.surname}`;
  const checkersEmail = user.email;

  return {
    makersEmail,
    checkersEmail,
    emailVariables: {
      ...commonVariables,
      makersName,
      checkersName,
      checkersEmail,
    },
  };
};

export default mapReturnToMakerEmailVariables;
