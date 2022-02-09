import facilityRiskProfileController from '..';
import api from '../../../../../api';
import { mockRes } from '../../../../../test-mocks';
import validateSubmittedValues from './validateSubmittedValues';

const res = mockRes();

const session = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['UNDERWRITER_MANAGERS'],
  },
};

const mockDeal = {
  _id: '61f6ac5b02ffda01b1e8efef',
  dealSnapshot: {
    _id: '61f6ac5b02ffda01b1e8efef',
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

describe('GET underwriting - facility risk profile', () => {
  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.getFacility = () => Promise.resolve(mockFacility);
    });

    it('should render edit facility risk profile template with data', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
          facilityId: mockFacility._id,
        },
        session,
      };

      await facilityRiskProfileController.getUnderWritingFacilityRiskProfileEdit(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/underwriting/pricing-and-risk/edit-facility-risk-profile/edit-facility-risk-profile.njk',
        {
          deal: mockDeal.dealSnapshot,
          facility: mockFacility,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
        },
      );
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

      await facilityRiskProfileController.getUnderWritingFacilityRiskProfileEdit(req, res);
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

      await facilityRiskProfileController.getUnderWritingFacilityRiskProfileEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('when user is in an unauthorised team', () => {
    it('should redirect to not-found route', async () => {
      const unauthUser = {
        _id: '12345678',
        username: 'testUser',
        firstName: 'Joe',
        lastName: 'Bloggs',
        teams: ['TEAM_1'],
      };

      const req = {
        params: {
          _id: mockDeal._id,
          facility: mockFacility._id,
        },
        session: {
          unauthUser,
        },
      };

      await facilityRiskProfileController.getUnderWritingFacilityRiskProfileEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST underwriting - facility risk profile', () => {
  describe('when there are NO validation errors', () => {
    const apiUpdateSpy = jest.fn(() => Promise.resolve({
      test: true,
    }));

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.getFacility = () => Promise.resolve(mockFacility);
      api.updateFacilityRiskProfile = apiUpdateSpy;
    });

    it('should call API and redirect to `/pricing-and-risk` route', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
          facilityId: mockFacility._id,
        },
        session,
        body: {
          riskProfile: 'Flat',
        },
      };

      await facilityRiskProfileController.postUnderWritingFacilityRiskProfileEdit(req, res);

      expect(apiUpdateSpy).toHaveBeenCalledWith(
        mockFacility._id,
        req.body,
      );

      expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/underwriting/pricing-and-risk`);
    });
  });

  describe('when there are validation errors', () => {
    const apiUpdateSpy = jest.fn(() => Promise.resolve({
      test: true,
    }));

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.getFacility = () => Promise.resolve(mockFacility);
      api.updateFacilityRiskProfile = apiUpdateSpy;
    });

    it('should render edit facility risk profile template with validation errors', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
          facilityId: mockFacility._id,
        },
        session,
        body: {
          riskProfile: '',
        },
      };

      await facilityRiskProfileController.postUnderWritingFacilityRiskProfileEdit(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'case/underwriting/pricing-and-risk/edit-facility-risk-profile/edit-facility-risk-profile.njk',
        {
          deal: mockDeal.dealSnapshot,
          facility: mockFacility,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          validationErrors: validateSubmittedValues(req.body),
        },
      );
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.getFacility = () => Promise.resolve(mockFacility);
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
          facilityId: mockFacility._id,
        },
        session,
        body: {
          riskProfile: '',
        },
      };

      await facilityRiskProfileController.postUnderWritingFacilityRiskProfileEdit(req, res);
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

      await facilityRiskProfileController.postUnderWritingFacilityRiskProfileEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
