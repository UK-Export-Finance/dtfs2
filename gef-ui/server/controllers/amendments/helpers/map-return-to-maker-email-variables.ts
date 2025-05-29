import dotenv from 'dotenv';
import { PortalFacilityAmendmentWithUkefId, PortalSessionUser } from '@ukef/dtfs2-common';
import { mapCommonEmailVariables } from './map-common-email-variables';
import { Deal } from '../../../types/deal';
import { Facility } from '../../../types/facility';

dotenv.config();

/**
 * maps emailVariables to an email on amendment return to maker
 * consumes deal, facility, amendment and user and maps to relevant format
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
  deal: Deal;
  facility: Facility;
  amendment: PortalFacilityAmendmentWithUkefId;
  user: PortalSessionUser;
}) => {
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
