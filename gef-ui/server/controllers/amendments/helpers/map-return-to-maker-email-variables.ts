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
  deal: Deal;
  facility: Facility;
  amendment: PortalFacilityAmendmentWithUkefId;
  user: PortalSessionUser;
}) => {
  const { maker } = deal;

  const commonVariables = mapCommonEmailVariables({ deal, facility, amendment });
  const makersName = `${String(maker.firstname)} ${String(maker.surname)}`;
  const makersEmail = String(maker.email);

  const { firstname, surname, email } = user;
  const checkersName = `${firstname} ${surname}`;
  const checkersEmail = email;

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
