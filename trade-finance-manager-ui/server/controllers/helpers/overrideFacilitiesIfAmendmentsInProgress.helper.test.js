const { AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const { overrideFacilitiesIfAmendmentsInProgress } = require('./overrideFacilitiesIfAmendmentsInProgress.helper');

describe('overrideFacilitiesIfAmendmentsInProgress', () => {
  const facilities = [
    {
      facilityId: '0',
      hasAmendmentInProgress: false,
    },
    {
      facilityId: '1',
      hasAmendmentInProgress: false,
    },
  ];

  const amendmentsOneCorresponding = [
    {
      status: AMENDMENT_STATUS.IN_PROGRESS,
      facilityId: '0',
    },
    {
      status: AMENDMENT_STATUS.NOT_STARTED,
      facilityId: '1',
    },
  ];

  const amendmentsNoneCorresponding = [
    {
      status: AMENDMENT_STATUS.IN_PROGRESS,
      facilityId: '2',
    },
    {
      status: AMENDMENT_STATUS.NOT_STARTED,
      facilityId: '1',
    },
  ];

  describe('when there is an in-progress amendment corresponding to one of the facilities', () => {
    it('should set the `hasAmendmentInProgress` property of the relevant facility to `true`', () => {
      const result = overrideFacilitiesIfAmendmentsInProgress(facilities, amendmentsOneCorresponding);

      expect(result).toEqual([
        {
          facilityId: '0',
          hasAmendmentInProgress: true,
        },
        facilities[1],
      ]);
    });
  });

  describe('when there is not an in-progress amendment corresponding to any of the facilities', () => {
    it('should returned the unmodified facilities', () => {
      const result = overrideFacilitiesIfAmendmentsInProgress(facilities, amendmentsNoneCorresponding);

      expect(result).toEqual(facilities);
    });
  });
});
