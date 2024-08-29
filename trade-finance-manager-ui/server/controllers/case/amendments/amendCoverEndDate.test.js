import { isTfmFacilityEndDateFeatureFlagEnabled, MAPPED_FACILITY_TYPE, TEAM_IDS } from '@ukef/dtfs2-common';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import { MOCK_AMENDMENT_COVERENDDATE_CHANGE, MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE } from '../../../test-mocks/amendment-test-mocks';
import { postAmendCoverEndDate } from './amendCoverEndDate.controller';
import { DEAL_TYPE } from '../../../constants/deal';

const res = mockRes();

api.getAmendmentById = jest.fn();
api.updateAmendment = jest.fn();
api.getFacility = jest.fn();

const user = {
  _id: '12345678',
  username: 'testUser',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: [TEAM_IDS.PIM],
  email: 'test@localhost',
};

const gefFacility = {
  facilitySnapshot: { dates: { coverEndDate: '1 Oct 2020' }, type: MAPPED_FACILITY_TYPE.CASH },
  tfm: {},
};

const bssEwcsFacility = {
  facilitySnapshot: { dates: { coverEndDate: '2 Oct 2020' }, type: MAPPED_FACILITY_TYPE.LOAN },
  tfm: {},
};

const { dealId, facilityId, amendmentId } = MOCK_AMENDMENT_COVERENDDATE_CHANGE;

const session = { user, userToken: 'mockToken' };

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('POST postAmendCoverEndDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const aRequest = () => ({
    params: {
      _id: dealId,
      amendmentId,
      facilityId,
    },
    body: {
      'cover-end-date-day': '12',
      'cover-end-date-month': '8',
      'cover-end-date-year': '2030',
    },
    session,
  });

  describe('TFM facility end date feature flag is enabled', () => {
    beforeEach(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
    });

    describe('GEF deal', () => {
      describe('when there are no errors when getting the facility or updating the amendment', () => {
        beforeEach(() => {
          api.getFacility.mockResolvedValueOnce(gefFacility);
          api.updateAmendment.mockResolvedValueOnce({ status: 200 });
        });

        describe('when the existing amendment is a cover end date change only', () => {
          it('should redirect to is using facility end date page', async () => {
            api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });

            await postAmendCoverEndDate(aRequest(), res);

            expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
          });
        });
      });
    });

    describe('BSS/EWCS deal', () => {
      describe('when there are no errors when getting the facility or updating the amendment', () => {
        beforeEach(() => {
          api.getFacility.mockResolvedValueOnce(bssEwcsFacility);
          api.updateAmendment.mockResolvedValueOnce({ status: 200 });
        });

        describe('when the existing amendment is a cover end date change only', () => {
          beforeEach(() => {
            api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });
          });

          it('should redirect to the check answers page when only changing cover end date', async () => {
            await postAmendCoverEndDate(aRequest(), res);

            expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
          });
        });

        describe('when the existing amendment is a facility value and cover end date change', () => {
          beforeEach(() => {
            api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE });
          });

          it('should redirect to the amend facility value page when amending facility value', async () => {
            await postAmendCoverEndDate(aRequest(), res);

            expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
          });
        });
      });
    });
  });

  describe('When the TFM facility end date feature flag is disabled', () => {
    beforeEach(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);
    });

    describe.each([
      { dealType: DEAL_TYPE.GEF, facility: gefFacility },
      { dealType: DEAL_TYPE.BSS_EWCS, facility: bssEwcsFacility },
    ])('when the facility is part of a $dealType deal', ({ facility }) => {
      it('should redirect to the check answers page when no errors and only changing cover end date', async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });
        api.getFacility.mockResolvedValueOnce(facility);
        api.updateAmendment.mockResolvedValueOnce({ status: 200 });

        await postAmendCoverEndDate(aRequest(), res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
      });

      it('should redirect to the amend facility value page when no errors and also amending facility value', async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE });
        api.getFacility.mockResolvedValueOnce(facility);
        api.updateAmendment.mockResolvedValueOnce({ status: 200 });

        await postAmendCoverEndDate(aRequest(), res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
      });
    });
  });
});
