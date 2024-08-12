import { isTfmFacilityEndDateFeatureFlagEnabled, TEAM_IDS } from '@ukef/dtfs2-common';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import { MOCK_AMENDMENT_COVERENDDATE_CHANGE, MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE } from '../../../test-mocks/amendment-test-mocks';
import { postAmendmentIsUsingFacilityEndDate } from './amendmentIsUsingFacilityEndDate.controller';

const res = mockRes();

api.getAmendmentById = jest.fn();
api.updateAmendment = jest.fn();

const user = {
  _id: '12345678',
  username: 'testUser',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: [TEAM_IDS.PIM],
  email: 'test@localhost',
};

const session = { user, userToken: 'mockToken' };

const { dealId, facilityId, amendmentId } = MOCK_AMENDMENT_COVERENDDATE_CHANGE;

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('amendmentIsUsingFacilityEndDate routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST getAmendmentIsUsingFacilityEndDate', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
    });

    it('should render the template with errors if no value is provided', async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });
      api.updateAmendment.mockResolvedValueOnce({ status: 200 });

      const req = {
        params: {
          _id: dealId,
          amendmentId,
          facilityId,
        },
        session,
        body: {
          isUsingFacilityEndDate: undefined,
        },
      };

      await postAmendmentIsUsingFacilityEndDate(req, res);
      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-is-using-facility-end-date.njk', {
        dealId,
        isEditable: true,
        facilityId,
        isUsingFacilityEndDate: undefined,
        errors: {
          errorSummary: [
            {
              text: 'Select if the bank has provided an end date for this facility',
              href: '#isUsingFacilityEndDate',
            },
          ],
          fieldErrors: {
            isUsingFacilityEndDate: { text: 'Select if the bank has provided an end date for this facility' },
          },
        },
        user: req.session.user,
      });
    });

    it('should redirect to the facility end date page when true is selected and there are no errors', async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });
      api.updateAmendment.mockResolvedValueOnce({ status: 200 });

      const req = {
        params: {
          _id: dealId,
          amendmentId,
          facilityId,
        },
        body: {
          isUsingFacilityEndDate: 'Yes',
        },
        session,
      };

      await postAmendmentIsUsingFacilityEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-end-date`);
    });

    it('should redirect to the update facility value page when false is selected, the facility value also needs updating and there are no errors', async () => {
      // TODO DTFS2-7222: This will instead redirect to the bank review page
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE });
      api.updateAmendment.mockResolvedValueOnce({ status: 200 });

      const req = {
        params: {
          _id: dealId,
          amendmentId,
          facilityId,
        },
        body: {
          isUsingFacilityEndDate: 'No',
        },
        session,
      };

      await postAmendmentIsUsingFacilityEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
    });

    it('should redirect to the check answers page when false is selected, only the cover date is to be updated and there are no errors', async () => {
      // TODO DTFS2-7222: This will instead redirect to the bank review page
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });
      api.updateAmendment.mockResolvedValueOnce({ status: 200 });

      const req = {
        params: {
          _id: dealId,
          amendmentId,
          facilityId,
        },
        body: {
          isUsingFacilityEndDate: 'No',
        },
        session,
      };

      await postAmendmentIsUsingFacilityEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
    });

    it("should redirect to the amendments summary page if there's an error updating the amendment", async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE });
      api.updateAmendment.mockResolvedValueOnce({ status: 400 });

      const req = {
        params: {
          _id: dealId,
          amendmentId,
          facilityId,
        },
        body: {
          isUsingFacilityEndDate: 'Yes',
        },
        session,
      };

      await postAmendmentIsUsingFacilityEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}#amendments`);
    });
  });
});
