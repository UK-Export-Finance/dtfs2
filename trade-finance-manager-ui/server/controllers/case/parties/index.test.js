import { TEAM_IDS } from '@ukef/dtfs2-common';
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
  teams: [TEAM_IDS.BUSINESS_SUPPORT],
};
const userNotAllowedToEdit = {
  ...user,
  teams: ['TEST'],
};
const session = { user };
const mockCompany = {
  partyUrn: '1234',
  name: 'Test',
  sfId: '0',
  companyRegNo: 'ABC123',
  type: null,
  subtype: null,
  isLegacyRecord: false,
};

describe('PartyURN: controllers - case - parties', () => {
  // GET HTTP METHOD
  describe('GET', () => {
    // All paries
    describe('GET case parties', () => {
      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          dealSnapshot: {
            _id: '61f6ac5b02fade01b1e8efef',
          },
          tfm: {
            parties: {
              exporter: {
                partyUrn: '1234',
              },
            },
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
            tfm: mockDeal.tfm,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            dealId: req.params._id,
            user: session.user,
            hasAmendmentInProgress: false,
            amendmentsInProgress: [],
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
          _id: '61f6ac5b02fade01b1e8efef',
          dealSnapshot: {
            _id: '61f6ac5b02fade01b1e8efef',
            submissionDetails: {
              supplierName: 'test supplier',
            },
          },
          tfm: {
            parties: {
              exporter: {
                partyUrn: '1234',
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
          _id: '61f6ac5b02fade01b1e8efef',
          dealSnapshot: {
            _id: '61f6ac5b02fade01b1e8efef',
            submissionDetails: {
              supplierName: 'test supplier',
            },
          },
          tfm: {
            parties: {
              buyer: {
                partyUrn: '1234',
              },
            },
          },
          mock: true,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
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
          _id: '61f6ac5b02fade01b1e8efef',
          dealSnapshot: {
            _id: '61f6ac5b02fade01b1e8efef',
            submissionDetails: {
              supplierName: 'test supplier',
            },
          },
          tfm: {
            parties: {
              agent: {
                partyUrn: '1234',
              },
            },
          },
          mock: true,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
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

    // 3. Indemnifier
    describe('GET: Indemnifier party specific page', () => {
      const party = 'indemnifier';
      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          dealSnapshot: {
            _id: '61f6ac5b02fade01b1e8efef',
            submissionDetails: {
              supplierName: 'test supplier',
            },
          },
          tfm: {
            parties: {
              indemnifier: {
                partyUrn: '1234',
              },
            },
          },
          mock: true,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
        });

        it('should render indemnifier edit template with data', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            session,
            url: `/case/${mockDeal._id}/parties/${party}`,
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

    // 4. Bond issuer
    describe('GET bond issuer edit', () => {
      const party = 'bond-issuer';

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          dealSnapshot: {
            _id: '61f6ac5b02fade01b1e8efef',
            submissionDetails: {
              supplierName: 'test supplier',
            },
          },
          tfm: {
            parties: {
              exporter: {
                partyUrn: '1234',
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
            urn: '',
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

          await partiesController.getBondUrnDetails(req, res);
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

          await partiesController.getBondUrnDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });
      });
    });

    // 4. Bond beneficiary
    describe('GET bond beneficiary edit', () => {
      const party = 'bond-beneficiary';

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          dealSnapshot: {
            _id: '61f6ac5b02fade01b1e8efef',
            submissionDetails: {
              supplierName: 'test supplier',
            },
          },
          tfm: {
            parties: {
              exporter: {
                partyUrn: '1234',
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
            urn: '',
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

          await partiesController.getBondUrnDetails(req, res);
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

          await partiesController.getBondUrnDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });
      });
    });
  });

  // POST HTTP METHOD
  describe('POST', () => {
    // 1. POST to summary page for confirmation
    describe('POST: Exporter party URN to summary page', () => {
      const party = 'exporter';

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              exporter: {
                partyUrnRequired: true,
              },
            },
          },
        };

        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            partyUrn: '1234',
          },
          session,
          url: `/case/1/parties/${party}`,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getParty = () =>
            Promise.resolve({
              status: 200,
              data: mockCompany,
            });
        });

        it('should render error page when party type is invalid', () => {
          req.body.url = '/';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render template with errors if partyUrn is empty', async () => {
          req.body.partyUrn = '';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a unique reference number', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a unique reference number' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn is letters only', async () => {
          req.body.partyUrn = 'ABCD';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn has special characters only', async () => {
          req.body.partyUrn = 'A$%D';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render non-existent party urn page', async () => {
          api.getParty = () => Promise.resolve(false);
          req.body.partyUrn = '12345';

          await partiesController.confirmPartyUrn(req, res);
          expect(res.render).toHaveBeenCalledWith('case/parties/non-existent.njk', {
            dealId: req.params._id,
            party,
            urn: req.body.partyUrn,
          });
        });

        it('should render party edit template with data', async () => {
          req.body.partyUrn = '1234';

          await partiesController.confirmPartyUrn(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties/${party}/summary/${req.body.partyUrn}`);
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

    describe('POST: Buyer party URN to summary page', () => {
      const party = 'buyer';

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              buyer: {
                partyUrnRequired: true,
              },
            },
          },
        };

        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            partyUrn: '1234',
          },
          session,
          url: `/case/1/parties/${party}`,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getParty = () =>
            Promise.resolve({
              status: 200,
              data: mockCompany,
            });
        });

        it('should render error page when party type is invalid', () => {
          req.body.url = '/';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render template with errors if partyUrn is empty', async () => {
          req.body.partyUrn = '';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a unique reference number', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a unique reference number' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn is letters only', async () => {
          req.body.partyUrn = 'ABCD';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn has special characters only', async () => {
          req.body.partyUrn = 'A$%D';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render non-existent party urn page', async () => {
          api.getParty = () => Promise.resolve(false);
          req.body.partyUrn = '12345';

          await partiesController.confirmPartyUrn(req, res);
          expect(res.render).toHaveBeenCalledWith('case/parties/non-existent.njk', {
            dealId: req.params._id,
            party,
            urn: req.body.partyUrn,
          });
        });

        it('should render party edit template with data', async () => {
          req.body.partyUrn = '1234';

          await partiesController.confirmPartyUrn(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties/${party}/summary/${req.body.partyUrn}`);
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

    describe('POST: Agent party URN to summary page', () => {
      const party = 'agent';

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              agent: {
                partyUrnRequired: true,
              },
            },
          },
        };

        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            partyUrn: '1234',
          },
          session,
          url: `/case/1/parties/${party}`,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getParty = () =>
            Promise.resolve({
              status: 200,
              data: mockCompany,
            });
        });

        it('should render error page when party type is invalid', () => {
          req.body.url = '/';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render template with errors if partyUrn is empty', async () => {
          req.body.partyUrn = '';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a unique reference number', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a unique reference number' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn is letters only', async () => {
          req.body.partyUrn = 'ABCD';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn has special characters only', async () => {
          req.body.partyUrn = 'A$%D';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render non-existent party urn page', async () => {
          api.getParty = () => Promise.resolve(false);
          req.body.partyUrn = '12345';

          await partiesController.confirmPartyUrn(req, res);
          expect(res.render).toHaveBeenCalledWith('case/parties/non-existent.njk', {
            dealId: req.params._id,
            party,
            urn: req.body.partyUrn,
          });
        });

        it('should render party edit template with data', async () => {
          req.body.partyUrn = '1234';

          await partiesController.confirmPartyUrn(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties/${party}/summary/${req.body.partyUrn}`);
        });

        it('should render party edit template with data including agent commission rate', async () => {
          req.body.partyUrn = '1234';
          req.body.commissionRate = '1.234';

          await partiesController.confirmPartyUrn(req, res);
          expect(req.session.commissionRate).toEqual('1.234');
          expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties/${party}/summary/${req.body.partyUrn}`);
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

    describe('POST: Indemnifier party URN to summary page', () => {
      const party = 'indemnifier';

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              indemnifier: {
                partyUrnRequired: true,
              },
            },
          },
        };

        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            partyUrn: '1234',
          },
          session,
          url: `/case/1/parties/${party}`,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getParty = () =>
            Promise.resolve({
              status: 200,
              data: mockCompany,
            });
        });

        it('should render error page when party type is invalid', () => {
          req.body.url = '/';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render template with errors if partyUrn is empty', async () => {
          req.body.partyUrn = '';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a unique reference number', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a unique reference number' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn is letters only', async () => {
          req.body.partyUrn = 'ABCD';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render template with errors if partyUrn has special characters only', async () => {
          req.body.partyUrn = 'A$%D';

          await partiesController.confirmPartyUrn(req, res);

          const expectedErrorSummary = {
            errorSummary: [{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }],
            fieldErrors: { partyUrn: { text: 'Enter a minimum of 3 numbers' } },
          };

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
            urn: req.body.partyUrn,
            errors: expectedErrorSummary,
          });
        });

        it('should render non-existent party urn page', async () => {
          api.getParty = () => Promise.resolve(false);
          req.body.partyUrn = '12345';

          await partiesController.confirmPartyUrn(req, res);
          expect(res.render).toHaveBeenCalledWith('case/parties/non-existent.njk', {
            dealId: req.params._id,
            party,
            urn: req.body.partyUrn,
          });
        });

        it('should render party edit template with data', async () => {
          req.body.partyUrn = '1234';

          await partiesController.confirmPartyUrn(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties/${party}/summary/${req.body.partyUrn}`);
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

    // 2. POST to TFM
    describe('POST: Exporter party URN to TFM post confirmation', () => {
      const party = 'exporter';

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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });
      });

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              exporter: {
                partyUrnRequired: true,
              },
            },
          },
        };

        const req = {
          params: {
            _id: mockDeal._id,
            urn: '1234',
          },
          body: {
            csrf: '12345',
          },
          session,
          url: `/case/1/parties/${party}`,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
          api.getParty = () =>
            Promise.resolve({
              status: 200,
              data: mockCompany,
            });
          api.updateParty = () => jest.fn();
        });

        it('should render error page when party type is invalid', () => {
          req.body.url = '/';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render error page when party URN is empty', () => {
          req.body.url = `/case/1/parties/${party}`;
          req.params.urn = '';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render error page when party URN is empty with spaces', () => {
          req.params.urn = '  ';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should submit party urn to TFM', async () => {
          req.params.urn = '1234';

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${req.params._id}/parties`);
        });
      });
    });

    describe('POST: Buyer party URN to TFM post confirmation', () => {
      const party = 'buyer';

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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });
      });

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              buyer: {
                partyUrnRequired: true,
              },
            },
          },
        };

        const req = {
          params: {
            _id: mockDeal._id,
            urn: '1234',
          },
          body: {
            csrf: '12345',
          },
          session,
          url: `/case/1/parties/${party}`,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
          api.getParty = () =>
            Promise.resolve({
              status: 200,
              data: mockCompany,
            });
          api.updateParty = () => jest.fn();
        });

        it('should render error page when party type is invalid', () => {
          req.body.url = '/';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render error page when party URN is empty', () => {
          req.body.url = `/case/1/parties/${party}`;
          req.params.urn = '';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render error page when party URN is empty with spaces', () => {
          req.params.urn = '  ';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should submit party urn to TFM', async () => {
          req.params.urn = '1234';

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${req.params._id}/parties`);
        });
      });
    });

    describe('POST: Agent party URN to TFM post confirmation', () => {
      const party = 'agent';

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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });
      });

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              agent: {
                partyUrnRequired: true,
              },
            },
          },
        };

        const req = {
          params: {
            _id: mockDeal._id,
            urn: '1234',
          },
          body: {
            csrf: '12345',
          },
          session,
          url: `/case/1/parties/${party}`,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
          api.getParty = () =>
            Promise.resolve({
              status: 200,
              data: mockCompany,
            });
          api.updateParty = () => jest.fn();
        });

        it('should render error page when party type is invalid', () => {
          req.body.url = '/';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render error page when party URN is empty', () => {
          req.body.url = `/case/1/parties/${party}`;
          req.params.urn = '';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render error page when party URN is empty with spaces', () => {
          req.params.urn = '  ';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should submit party urn to TFM', async () => {
          req.params.urn = '1234';

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${req.params._id}/parties`);
        });

        it('should submit party urn and commission rate to TFM', async () => {
          req.params.urn = '1234';
          req.session.commissionRate = '1.234';

          await partiesController.postPartyDetails(req, res);

          // Delete session variable `commissionRate`
          expect(req.session.commissionRate).toEqual(undefined);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${req.params._id}/parties`);
        });
      });
    });

    describe('POST: Indemnifier party URN to TFM post confirmation', () => {
      const party = 'indemnifier';

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
            url: `/case/1/parties/${party}`,
          };

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });
      });

      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          mock: true,
          tfm: {
            parties: {
              indemnifier: {
                partyUrnRequired: true,
              },
            },
          },
        };

        const req = {
          params: {
            _id: mockDeal._id,
            urn: '1234',
          },
          body: {
            csrf: '12345',
          },
          session,
          url: `/case/1/parties/${party}`,
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
          api.getParty = () =>
            Promise.resolve({
              status: 200,
              data: mockCompany,
            });
          api.updateParty = () => jest.fn();
        });

        it('should render error page when party type is invalid', () => {
          req.body.url = '/';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render error page when party URN is empty', () => {
          req.body.url = `/case/1/parties/${party}`;
          req.params.urn = '';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should render error page when party URN is empty with spaces', () => {
          req.params.urn = '  ';

          expect(res.redirect).toHaveBeenCalledWith('/not-found');
        });

        it('should submit party urn to TFM', async () => {
          req.params.urn = '1234';

          await partiesController.postPartyDetails(req, res);
          expect(res.redirect).toHaveBeenCalledWith(`/case/${req.params._id}/parties`);
        });
      });
    });
  });
});
