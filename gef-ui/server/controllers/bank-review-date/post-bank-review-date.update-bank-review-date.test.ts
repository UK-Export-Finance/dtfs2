/* eslint-disable import/first */
const updateFacilityMock = jest.fn();
const updateApplicationMock = jest.fn();

import { aPortalSessionUser } from '@ukef/dtfs2-common';
import { Facility } from '../../types/facility';
import { updateBankReviewDateIfChanged } from './post-bank-review-date';
import { LoggedInUserSession } from '../../utils/express-session';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('../../services/api', () => ({
  updateFacility: updateFacilityMock,
  updateApplication: updateApplicationMock,
}));

const facilityId = 'facilityId';
const dealId = 'dealId';

const bankReviewDate = new Date();

const sessionData = {
  user: aPortalSessionUser(),
  userToken: 'userToken',
} as LoggedInUserSession;
describe('updateBankReviewDateIfChanged', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when bank review date has changed', () => {
    const existingFacility = {
      _id: facilityId,
      dealId,
      bankReviewDate: new Date(2024, 9, 5).toISOString(),
    } as Facility;

    it('updates the bank review date', async () => {
      await updateBankReviewDateIfChanged(existingFacility, bankReviewDate, sessionData);

      expect(updateFacilityMock).toHaveBeenCalledTimes(1);
      expect(updateFacilityMock).toHaveBeenCalledWith({
        facilityId,
        payload: {
          bankReviewDate,
        },
        userToken: sessionData.userToken,
      });
    });

    it('updates the deal editorId', async () => {
      await updateBankReviewDateIfChanged(existingFacility, bankReviewDate, sessionData);

      expect(updateApplicationMock).toHaveBeenCalledTimes(1);
      expect(updateApplicationMock).toHaveBeenCalledWith({ dealId, application: { editorId: sessionData.user._id }, userToken: sessionData.userToken });
    });
  });

  describe('when bank review date was previously null', () => {
    const existingFacility = {
      _id: facilityId,
      dealId,
      bankReviewDate: null,
    } as Facility;

    it('updates the bank review date', async () => {
      await updateBankReviewDateIfChanged(existingFacility, bankReviewDate, sessionData);

      expect(updateFacilityMock).toHaveBeenCalledTimes(1);
      expect(updateFacilityMock).toHaveBeenCalledWith({
        facilityId,
        payload: {
          bankReviewDate,
        },
        userToken: sessionData.userToken,
      });
    });

    it('updates the deal editorId', async () => {
      await updateBankReviewDateIfChanged(existingFacility, bankReviewDate, sessionData);

      expect(updateApplicationMock).toHaveBeenCalledTimes(1);
      expect(updateApplicationMock).toHaveBeenCalledWith({ dealId, application: { editorId: sessionData.user._id }, userToken: sessionData.userToken });
    });
  });

  describe('when bank review date has not changed', () => {
    const existingFacility = {
      _id: facilityId,
      dealId,
      bankReviewDate: bankReviewDate.toISOString(),
    } as Facility;

    it('does not update the facility', async () => {
      await updateBankReviewDateIfChanged(existingFacility, bankReviewDate, sessionData);

      expect(updateFacilityMock).toHaveBeenCalledTimes(0);
    });

    it('does not update the deal', async () => {
      await updateBankReviewDateIfChanged(existingFacility, bankReviewDate, sessionData);

      expect(updateApplicationMock).toHaveBeenCalledTimes(0);
    });
  });
});
