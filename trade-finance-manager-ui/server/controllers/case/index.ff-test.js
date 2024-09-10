import { AMENDMENT_STATUS, isTfmFacilityEndDateFeatureFlagEnabled } from '@ukef/dtfs2-common';
import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

const res = mockRes();

const TOKEN = 'test-token';

const SESSION = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['TEAM1'],
  },
  userToken: TOKEN,
};

describe('controllers - case', () => {
  beforeEach(() => {
    jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
  });

  describe('GET case facility', () => {
    describe('when facility exists', () => {
      const mockFacility = {
        _id: '61f6ac5b02fade01b1e8efef',
        facilitySnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
          isGef: true,
          dealId: '12345678',
          mock: true,
          value: 'GBP 1,000,000.00',
          dates: {
            coverEndDate: '2030-08-12T00:00:00.000+00:00',
          },
        },
        tfm: {
          ukefExposure: { exposure: 'GBP 57.21', timestamp: '1614954617041' },
          facilityValueInGBP: 238.39322963227846,
        },
      };

      const mockAmendment = {
        amendmentId: '6284bde5241c63001e40702d',
        facilityId: '625e99cb88eeeb001e33bf4b',
        dealId: '625e99cb88eeeb001e33bf47',
        createdAt: 1652866533,
        updatedAt: 1652876975,
        status: AMENDMENT_STATUS.IN_PROGRESS,
        version: 1,
        createdBy: {},
        requestDate: 1652876967,
        changeCoverEndDate: true,
        changeFacilityValue: true,
        requireUkefApproval: false,
        coverEndDate: 1660307372,
        submittedByPim: true,
        effectiveDate: 1655027294,
        submissionDate: 1652867309,
        value: 112,
      };

      const mockDeal = {
        _id: '12345678',
        dealSnapshot: {
          _id: '12345678',
          mock: true,
        },
        tfm: {},
      };

      beforeEach(() => {
        api.getFacility = () => Promise.resolve(mockFacility);
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentInProgress = () => Promise.resolve({ status: 200, data: { amendmentId: '626bae8c43c01e02076352e1', version: 1 } });
        api.getAmendmentsByFacilityId = () => Promise.resolve({ status: 200, data: [mockAmendment] });
        api.getAmendmentsByDealId = () => Promise.resolve({ status: 200, data: [mockAmendment] });
      });

      it('should render facility template with data', async () => {
        const req = {
          params: {
            facilityId: mockFacility._id,
          },
          session: SESSION,
        };

        await caseController.getCaseFacility(req, res);
        expect(res.render).toHaveBeenCalledWith('case/facility/facility.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          facility: mockFacility.facilitySnapshot,
          facilityTfm: mockFacility.tfm,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'facility',
          facilityId: req.params.facilityId,
          user: SESSION.user,
          showAmendmentButton: false,
          showContinueAmendmentButton: false,
          amendmentId: '626bae8c43c01e02076352e1',
          amendmentVersion: 1,
          hasAmendmentInProgress: true,
          hasAmendmentInProgressButton: false,
          allAmendments: expect.any(Array),
          amendmentsInProgress: expect.any(Array),
          amendments: expect.any(Array),
          showFacilityEndDate: true,
        });
      });
    });
  });
});
