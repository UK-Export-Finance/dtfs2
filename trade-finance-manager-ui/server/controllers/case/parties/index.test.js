/* eslint-disable no-underscore-dangle */
import partiesController from '.';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import userCanEdit from './helpers';

const res = mockRes();

const user = {
  _id: '12345678',
  username: 'testUser',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['BUSINESS_SUPPORT'],
};

const userNotAllowedToEdit = {
  ...user,
  teams: ['TEST'],
};

const session = { user };

describe('controllers - case - parties', () => {
  describe('GET case parties', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await partiesController.getCaseParties(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/parties.njk', {
          userCanEdit: userCanEdit(req.session.user),
          renderEditLink: userCanEdit(req.session.user),
          renderEditForm: false,
          deal: mockDeal.dealSnapshot,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'parties',
          dealId: req.params._id,
          user: session.user,
        });
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

        await partiesController.getCaseParties(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET exporter edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
          submissionDetails: {
            supplierName: 'test supplier',
          },
        },
        tfm: {
          parties: {
            exporter: {
              partyUrn: '12345',
            },
          },
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render exporter edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await partiesController.getExporterPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/edit/exporter-edit.njk', {
          userCanEdit: userCanEdit(req.session.user),
          renderEditLink: false,
          renderEditForm: true,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'parties',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: req.params._id,
          user: session.user,
        });
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

        await partiesController.getExporterPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });

    describe('when user is not allowed to edit', () => {
      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session: {
            user: userNotAllowedToEdit,
          },
        };

        await partiesController.getExporterPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET bond issuer edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
          submissionDetails: {
            supplierName: 'test supplier',
          },
        },
        tfm: {
          parties: {
            exporter: {
              partyUrn: '12345',
            },
          },
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render bond issuer edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await partiesController.getBondIssuerPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith(
          'case/parties/edit/bonds-issuer-edit.njk',
          {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
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

        await partiesController.getBondIssuerPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });

    describe('when user is not allowed to edit', () => {
      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session: {
            user: userNotAllowedToEdit,
          },
        };

        await partiesController.getBondIssuerPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET bond beneficiary edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
          submissionDetails: {
            supplierName: 'test supplier',
          },
        },
        tfm: {
          parties: {
            exporter: {
              partyUrn: '12345',
            },
          },
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render bond beneficiary edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await partiesController.getBondBeneficiaryPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith(
          'case/parties/edit/bonds-beneficiary-edit.njk',
          {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
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

        await partiesController.getBondBeneficiaryPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });

    describe('when user is not allowed to edit', () => {
      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session: {
            user: userNotAllowedToEdit,
          },
        };

        await partiesController.getBondBeneficiaryPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST party edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render party edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            exporter: {
              partyUrn: '12345',
            },
          },
          session,
        };

        await partiesController.postExporterPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
      });

      it('should redirect to not-found route', async () => {
        const req = {
          body: {
            csrf: '12345',
          },
          params: {
            _id: '1',
          },
          session,
        };

        await partiesController.postExporterPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });

    describe('when user is not allowed to edit', () => {
      it('should redirect to not-found route', async () => {
        const req = {
          body: {
            csrf: '12345',
          },
          params: {
            _id: '1',
          },
          session: {
            user: userNotAllowedToEdit,
          },
        };

        await partiesController.postExporterPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });
});

/* eslint-enable no-underscore-dangle */
