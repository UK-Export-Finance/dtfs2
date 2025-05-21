import { format } from 'date-fns';
import dotenv from 'dotenv';
import { PortalFacilityAmendmentWithUkefId, DATE_FORMATS, PortalSessionUser, now } from '@ukef/dtfs2-common';
import { mapCommonEmailVariables } from './map-common-email-variables';
import { Deal } from '../../../types/deal';
import { Facility } from '../../../types/facility';

dotenv.config();

const { PORTAL_UI_URL } = process.env;

/**
 * maps emailVariables to an email on amendment submission to checker
 * consumes deal, facility, amendment and user and maps to relevant format
 * @param deal
 * @param facility
 * @param amendment
 * @param user
 * @param checker
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
  const commonVariables = mapCommonEmailVariables({ deal, facility, amendment });

  const makersName = `${user.firstname} ${user.surname}`;
  const makersEmail = user.email;

  const checkersName = `${checker.firstname} ${checker.surname}`;
  const checkersEmail = checker.email;

  const dateSubmittedByMaker = format(now(), DATE_FORMATS.DD_MMMM_YYYY);

  const portalUrl = `${PORTAL_UI_URL}/login`;

  return {
    ...commonVariables,
    makersName,
    makersEmail,
    dateSubmittedByMaker,
    checkersName,
    checkersEmail,
    portalUrl,
  };
};

export default mapSubmittedToCheckerEmailVariables;
