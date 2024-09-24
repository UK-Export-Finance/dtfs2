import { ObjectId } from 'mongodb';
import { TfmDeal, Deal } from '../database-client';

/**
 * Creates an active tfm deal that can be used for utilisation reporting testing.
 * It can be replaced by creating a deal manually and then pulling from the mongo db collection.
 * This way we ensure we are inserting a valid deal.
 * @param dealId - id of deal
 * @param portalUserId - id of a portal user
 * @param dealSnapshot - a deal
 * @returns a tfm deal
 */
export const aTfmDeal = (dealId: ObjectId, portalUserId: ObjectId, dealSnapshot: Deal): TfmDeal => ({
  _id: dealId,
  dealSnapshot,
  tfm: {
    dateReceived: '11-09-2024',
    dateReceivedTimestamp: 1726061296,
    parties: {
      exporter: {
        partyUrn: '',
        partyUrnRequired: true,
      },
      buyer: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      indemnifier: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      agent: {
        partyUrn: '',
        partyUrnRequired: false,
      },
    },
    activities: [],
    product: 'GEF',
    stage: 'Confirmed',
    lossGivenDefault: 50,
    exporterCreditRating: 'Acceptable (B+)',
    probabilityOfDefault: 0.02,
    lastUpdated: 1726061303267,
    tasks: [
      {
        groupTitle: 'Set up deal',
        id: 1,
        groupTasks: [
          {
            id: '1',
            groupId: 1,
            title: 'Match or create the parties in this deal',
            team: {
              id: 'BUSINESS_SUPPORT',
              name: 'Business support group',
            },
            isConditional: true,
            status: 'To do',
            assignedTo: {
              userId: 'Unassigned',
              userFullName: 'Unassigned',
            },
            canEdit: true,
            history: [],
            emailSent: true,
          },
          {
            id: '2',
            groupId: 1,
            title: 'Create or link this opportunity in Salesforce',
            team: {
              id: 'BUSINESS_SUPPORT',
              name: 'Business support group',
            },
            status: 'Cannot start yet',
            assignedTo: {
              userId: 'Unassigned',
              userFullName: 'Unassigned',
            },
            canEdit: false,
            history: [],
          },
        ],
      },
    ],
  },
  auditRecord: {
    lastUpdatedAt: '2024-09-11T13:28:23.267 +00:00',
    lastUpdatedByPortalUserId: portalUserId,
    lastUpdatedByTfmUserId: null,
    lastUpdatedByIsSystem: null,
    noUserLoggedIn: null,
  },
});
