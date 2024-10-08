const { AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const { DEAL } = require('../../constants');
const { overrideDealsIfAmendmentsInProgress } = require('./overrideDealsIfAmendmentsInProgress.helper');

describe('overrideDealsIfAmendmentsInProgress', () => {
  const deals = [
    {
      _id: '0',
      tfm: {
        stage: DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS,
      },
    },
    {
      _id: '1',
      tfm: {
        stage: DEAL.DEAL_STAGE.APPROVED_WITHOUT_CONDITIONS,
      },
    },
  ];

  const amendmentsOneCorresponding = [
    {
      status: AMENDMENT_STATUS.IN_PROGRESS,
      dealId: '0',
    },
    {
      status: AMENDMENT_STATUS.NOT_STARTED,
      dealId: '1',
    },
  ];

  const amendmentsNoneCorresponding = [
    {
      status: AMENDMENT_STATUS.IN_PROGRESS,
      dealId: '2',
    },
    {
      status: AMENDMENT_STATUS.NOT_STARTED,
      dealId: '1',
    },
  ];

  describe('when there is an in-progress amendment corresponding to one of the deals', () => {
    it('should override the deal stage of the relevant deal', () => {
      const result = overrideDealsIfAmendmentsInProgress(deals, amendmentsOneCorresponding);

      expect(result).toEqual([
        {
          _id: '0',
          tfm: {
            stage: DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS,
          },
        },
        deals[1],
      ]);
    });
  });

  describe('when there is not an in-progress amendment corresponding to any of the deals', () => {
    it('should returned the unmodified deals', () => {
      const result = overrideDealsIfAmendmentsInProgress(deals, amendmentsNoneCorresponding);

      expect(result).toEqual(deals);
    });
  });
});
