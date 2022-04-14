import {
  getGroup,
  getTask,
  showAmendmentButton,
} from './helpers';

const CONSTANTS = require('../../constants');

describe('case - helpers', () => {
  describe('getGroup', () => {
    it('should return group by id', () => {
      const mockTasks = [
        {
          id: 1,
          groupTasks: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
          ],
        },
      ];

      const result = getGroup(1, mockTasks);
      expect(result).toEqual(mockTasks[0]);
    });
  });

  describe('getTask', () => {
    it('should return task by groupId and taskId', () => {
      const mockTasks = [
        {
          id: 1,
          groupTasks: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
          ],
        },
      ];
      const result = getTask(1, 3, mockTasks);
      expect(result).toEqual(mockTasks[0].groupTasks[2]);
    });

    it('should return null when group does not exist', () => {
      const mockTasks = [
        {
          id: 1,
          groupTasks: [],
        },
      ];
      const result = getTask(2, 1, mockTasks);
      expect(result).toEqual(null);
    });

    it('should return null when task does not exist', () => {
      const mockTasks = [
        {
          id: 1,
          groupTasks: [{ id: 1 }],
        },
      ];
      const result = getTask(1, 2, mockTasks);
      expect(result).toEqual(null);
    });
  });

  describe('showAmendmentButton()', () => {
    const deal = {
      dealSnapshot: {},
      tfm: {},
    };
    let userTeam;
    it('return true if AIN and confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
      userTeam = ['PIM'];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(true);
    });

    it('return false if AIN and confirmed and not PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
      userTeam = ['UNDERWRITER_MANAGERS'];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if AIN and not confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
      userTeam = ['PIM'];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return true if MIN and confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
      userTeam = ['PIM'];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(true);
    });

    it('return false if MIN and confirmed and not PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
      userTeam = ['UNDERWRITER_MANAGERS'];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if MIN and not confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
      userTeam = ['PIM'];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if MIA and confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
      userTeam = ['PIM'];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if MIA and confirmed and not PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
      userTeam = ['UNDERWRITER_MANAGERS'];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if MIA and not confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
      userTeam = ['PIM'];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });
  });
});
