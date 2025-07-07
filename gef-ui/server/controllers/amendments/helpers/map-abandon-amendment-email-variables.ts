import dotenv from 'dotenv';
import { PortalFacilityAmendmentWithUkefId, PortalSessionUser } from '@ukef/dtfs2-common';
import { mapCommonEmailVariables } from './map-common-email-variables';
import { Deal } from '../../../types/deal';
import { Facility } from '../../../types/facility';

dotenv.config();

/**
 * Maps email variables for a GovNotify email when maker abandon the amendment.
 * Consumes deal, facility, amendment and user data and maps to relevant email variables.
 * @param deal
 * @param facility
 * @param amendment
 * @param user
 * @returns mapped email variables
 */
const mapAbandonEmailVariables = ({
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
  const commonVariables = mapCommonEmailVariables({ deal, facility, amendment });

  const checkersName = `${checker?.firstname} ${checker?.surname}`;
  const checkersEmail = checker?.email;

  const { firstname, surname, email } = user;
  const makersName = `${firstname} ${surname}`;
  const makersEmail = email;

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

export default mapAbandonEmailVariables;
