import { Response } from 'supertest';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { AnyObject, DealSubmissionType, DealType, PortalUser, TFM_DEAL_STAGE } from '@ukef/dtfs2-common';
import { testApi } from '../test-api';
import { aPortalUser } from '../mocks/test-users/portal-user';

interface CreateDealResponse extends Response {
  body: { _id: string };
}

/**
 * Create a deal
 * @param createDealParams
 * @param createDealParams.deal - the deal to create
 * @param createDealParams.user - the user creating the deal
 * @returns the audit details, response body and response status
 */
export const createDeal = async ({ deal, user }: { deal: AnyObject; user: PortalUser }) => {
  const auditDetails = generatePortalAuditDetails(user._id);
  const { body, status } = (await testApi.post({ deal, user, auditDetails }).to('/v1/portal/deals')) as CreateDealResponse;

  return { auditDetails, body, status };
};

/**
 * Submit a deal to TFM
 * @param submitDealToTfmParams
 * @param submitDealToTfmParams.dealId - the deal to create
 * @param submitDealToTfmParams.dealSubmissionType - the deal submission type
 * @param submitDealToTfmParams.dealType - the deal type
 */
export const submitDealToTfm = async ({
  dealId,
  dealSubmissionType,
  dealType,
}: {
  dealId: string;
  dealSubmissionType: DealSubmissionType;
  dealType: DealType;
}): Promise<void> => {
  await testApi
    .put({
      dealType,
      dealId,
      submissionType: dealSubmissionType,
      auditDetails: generatePortalAuditDetails(aPortalUser()._id),
    })
    .to('/v1/tfm/deals/submit');

  await testApi
    .put({
      dealUpdate: {
        tfm: {
          dateReceived: '23-09-2024',
          dateReceivedTimestamp: 1727085149,
          parties: {},
          activities: [],
          product: dealType,
          stage: TFM_DEAL_STAGE.CONFIRMED,
          exporterCreditRating: 'Acceptable (B+)',
          lastUpdated: 1727085149571,
          lossGivenDefault: 50,
          probabilityOfDefault: 12,
        },
      },
      auditDetails: generatePortalAuditDetails(aPortalUser()._id),
    })
    .to(`/v1/tfm/deals/${dealId}`);
};
