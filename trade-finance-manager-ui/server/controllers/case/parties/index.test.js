/* eslint-disable no-underscore-dangle */
import partiesController from '.';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import { userCanEdit } from './helpers';

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

describe('PartyURN: controllers - case - parties', () => {
  // GET HTTP METHOD

  // All paries
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
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await partiesController.getAllParties(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/parties.njk', {
          userCanEdit: userCanEdit(req.session.user),
          renderEditLink: userCanEdit(req.session.user),
          renderEditForm: false,
          deal: mockDeal.dealSnapshot,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'parties',
          dealId: req.params._id,
          user: session.user,
          amendmentsInProgress: [],
          hasAmendmentInProgress: false,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
        };

        await partiesController.getAllParties(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  // 1. Exporter
  describe('GET: Exporter party specific page', () => {
    const party = 'exporter';

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
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should render exporter edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          url: `/case/${mockDeal._id}/parties/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith(`case/parties/edit/${party}.njk`, {
          userCanEdit: userCanEdit(req.session.user),
          renderEditLink: false,
          renderEditForm: true,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'parties',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: req.params._id,
          user: session.user,
          urn: mockDeal.tfm.parties.exporter.partyUrn,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
          url: `/case/1/parties/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
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
          url: `/case/1/parties/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  // 2. Buyer
  describe('GET: Buyer party specific page', () => {
    const party = 'buyer';

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
            buyer: {
              partyUrn: '12345',
            },
          },
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should render agent edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          url: `/case/${mockDeal._id}/parties/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/edit/buyer.njk', {
          userCanEdit: userCanEdit(req.session.user),
          renderEditLink: false,
          renderEditForm: true,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'parties',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: req.params._id,
          user: session.user,
          urn: mockDeal.tfm.parties.buyer.partyUrn,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
          url: `/case/1/parties/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
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
          url: `/case/1/parties/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  // 3. Agent
  describe('GET: Agent party specific page', () => {
    const party = 'agent';

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
            agent: {
              partyUrn: '12345',
            },
          },
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should render agent edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          url: `/case/${mockDeal._id}/agent/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/edit/agent.njk', {
          userCanEdit: userCanEdit(req.session.user),
          renderEditLink: false,
          renderEditForm: true,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'parties',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: req.params._id,
          user: session.user,
          urn: mockDeal.tfm.parties.agent.partyUrn,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
          url: `/case/1/agent/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
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
          url: `/case/1/agent/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  // 3. Indemnifier
  describe('GET: Indemnifier party specific page', () => {
    const party = 'indemnifier';
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
            indemnifier: {
              partyUrn: '12345',
            },
          },
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should render agent edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          url: `/case/${mockDeal._id}/agent/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/edit/indemnifier.njk', {
          userCanEdit: userCanEdit(req.session.user),
          renderEditLink: false,
          renderEditForm: true,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'parties',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: req.params._id,
          user: session.user,
          urn: mockDeal.tfm.parties.indemnifier.partyUrn,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
          url: `/case/1/agent/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
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
          url: `/case/1/agent/${party}`,
        };

        await partiesController.getPartyDetails(req, res);
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
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
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
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
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
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
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
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
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

  // POST HTTP METHOD
  describe('POST party edit', () => {
    // 1. Exporter
    describe('POST: Exporter party specific page', () => {
      const party = 'exporter';

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02ffda01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              exporter: {
                partyUrnRequired: true,
              },
            },
          },
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
        });

        it('should render party edit template with data', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '12345',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
        });

        it('should render template with errors if partyUrn is blank', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a unique reference number', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a unique reference number' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/exporter.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn is letters only', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: 'ABCDE',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/exporter.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn has special characters', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '1234!',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/exporter.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });
      });

      describe('when deal does NOT exist', () => {
        beforeEach(() => {
          api.getDeal = () => Promise.resolve();
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });
      });
    });

    // 2. Buyer
    describe('POST: Buyer party specific page', () => {
      const party = 'buyer';

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02ffda01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              buyer: {
                partyUrnRequired: true,
              },
            },
          },
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
        });

        it('should render party edit template with data', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '12345',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
        });

        it('should render template with errors if partyUrn is blank', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a unique reference number', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a unique reference number' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/buyer.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn is letters only', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: 'ABCDE',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/buyer.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn has special characters', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '1234!',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/buyer.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });
      });

      describe('when deal does NOT exist', () => {
        beforeEach(() => {
          api.getDeal = () => Promise.resolve();
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
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

          await partiesController.postPartyDetails(req, res);
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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });
      });
    });

    // 3. Agent
    describe('POST: Agent party specific page', () => {
      const party = 'agent';

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02ffda01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              agent: {
                partyUrnRequired: true,
              },
            },
          },
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
        });

        it('should render party edit template with data', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '12345',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
        });

        it('should render template with errors if partyUrn is blank', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a unique reference number', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a unique reference number' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/agent.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn is letters only', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: 'ABCDE',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/agent.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn has special characters', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '1234!',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/agent.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });
      });

      describe('when deal does NOT exist', () => {
        beforeEach(() => {
          api.getDeal = () => Promise.resolve();
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });
      });
    });

    // 4. Indemnifier
    describe('POST: Indemnifier party specific page', () => {
      const party = 'indemnifier';

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02ffda01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              indemnifier: {
                partyUrnRequired: true,
              },
            },
          },
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
        });

        it('should render party edit template with data', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '12345',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
        });

        it('should render template with errors if partyUrn is blank', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a unique reference number', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a unique reference number' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/indemnifier.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn is letters only', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: 'ABCDE',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/indemnifier.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn has special characters', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            body: {
              partyUrn: '1234!',
            },
            session,
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

          expect(res.render).toHaveBeenCalledWith('case/parties/edit/indemnifier.njk', {
            userCanEdit: userCanEdit(req.session.user),
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            dealId: req.params._id,
            user: session.user,
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });
      });

      describe('when deal does NOT exist', () => {
        beforeEach(() => {
          api.getDeal = () => Promise.resolve();
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });
      });
    });
  });
});
