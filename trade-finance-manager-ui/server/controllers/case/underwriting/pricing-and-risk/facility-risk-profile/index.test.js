/* eslint-disable no-underscore-dangle */
import facilityRiskProfileController from '..';
import api from '../../../../../api';
import { mockRes } from '../../../../../test-mocks';

const res = mockRes();

const session = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['UNDERWRITING_SUPPORT'],
  },
};

describe('GET underwriting - loss given default', () => {
  const mockDeal = {
    _id: '1000023',
    dealSnapshot: {
      _id: '1000023',
      submissionDetails: {
        supplierName: 'test supplier',
      },
    },
    tfm: {
      lossGivenDefault: '50',
    },
  };

  const mockFacility = {
    _id: '1234',
    facilitySnapshot: {
      _id: '1234',
    },
    tfm: {},
  };

  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.getFacility = () => Promise.resolve(mockFacility);
    });

    it('should render loss given default template with data', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
          facilityId: mockFacility._id,
        },
        session,
      };

      await facilityRiskProfileController.getUnderWritingRiskFacilityRiskProfileEdit(req, res);
      expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/edit-facility-risk-profile/edit-facility-risk-profile.njk',
        {
          deal: mockDeal.dealSnapshot,
          facility: mockFacility,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
        });
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
      api.getFacility = () => Promise.resolve(mockFacility);
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
          facilityId: mockFacility._id,
        },
        session,
      };

      await facilityRiskProfileController.getUnderWritingRiskFacilityRiskProfileEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('when facility does NOT exist', () => {
    beforeEach(() => {
      api.getFacility = () => Promise.resolve();
      api.getDeal = () => Promise.resolve(mockFacility);
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
          facility: mockFacility._id,
        },
        session,
      };

      await facilityRiskProfileController.getUnderWritingRiskFacilityRiskProfileEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
