import underwritingController from '.';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';

const res = mockRes();

const session = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['TEAM1'],
  },
};

describe('GET underwriting - bank security', () => {
  describe('when deal exists', () => {
    const mockDeal = {
      _id: '1000023',
      dealSnapshot: {
        _id: '1000023',
        dealFiles: {
          security: 'mock security',
        },
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {},
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should render bank security with data', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
      };

      await underwritingController.getUnderWritingBankSecurity(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/underwriting/bank-security/bank-security.njk',
        {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'underwriting',
          activeSideNavigation: 'bank security',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
          user: session.user,
        },
      );
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session,
      };

      await underwritingController.getUnderWritingBankSecurity(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
