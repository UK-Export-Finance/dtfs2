import dotenv from 'dotenv';
import { PortalFacilityAmendmentWithUkefId, PortalSessionUser, generateAmendmentMandatoryCriteria } from '@ukef/dtfs2-common';
import { mapCommonEmailVariables } from './map-common-email-variables';
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
 * @returns an object with makersEmail checkersEmail and email variables
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
  const commonVariables = mapCommonEmailVariables({ deal, facility, amendment });

  const criteria = amendment.eligibilityCriteria?.criteria || [];
  const formattedEligibilityCriteria = generateAmendmentMandatoryCriteria(criteria);

  const makersName = `${String(deal.maker.firstname)} ${String(deal.maker.surname)}`;
  const makersEmail = String(deal.maker.email);

  const checkersName = `${user.firstname} ${user.surname}`;
  const checkersEmail = user.email;

  const makersBank = deal.maker.bank;
  const bankName = makersBank ? (makersBank as { name: string }).name : '-';

  return {
    makersEmail,
    checkersEmail,
    emailVariables: {
      ...commonVariables,
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
