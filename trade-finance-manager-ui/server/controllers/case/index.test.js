import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';

const res = mockRes();

const session = {
  user: {
    username: 'testUser',
  },
};

describe('controllers - case', () => {
  describe('GET case deal', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
          },
          session,
        };

        await caseController.getCaseDeal(req, res);
        expect(res.render).toHaveBeenCalledWith('case/deal/deal.njk', {
          deal: mockDeal.dealSnapshot,
          active_sheet: 'deal',
          dealId: req.params._id, // eslint-disable-line no-underscore-dangle
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

        await caseController.getCaseDeal(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET case facility', () => {
    describe('when facility exists', () => {
      const mockFacility = {
        _id: '1000023',
        facilitySnapshot: {
          _id: '1000023',
          associatedDealId: '12345678',
          mock: true,
        },
      };

      const mockDeal = {
        _id: '12345678',
        dealSnapshot: {
          _id: '12345678',
          mock: true,
        },
      };

      beforeEach(() => {
        api.getFacility = () => Promise.resolve(mockFacility);
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            facilityId: mockFacility._id, // eslint-disable-line no-underscore-dangle
          },
          session,
        };

        await caseController.getCaseFacility(req, res);
        expect(res.render).toHaveBeenCalledWith('case/facility/facility.njk', {
          deal: mockDeal.dealSnapshot,
          dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
          facility: mockFacility.facilitySnapshot,
          active_sheet: 'facility',
          facilityId: req.params.facilityId,
          user: session.user,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getFacility = () => Promise.resolve();
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
        };

        await caseController.getCaseFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });


  describe('GET case parties', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
          },
          session,
        };

        await caseController.getCaseParties(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/parties.njk', {
          deal: mockDeal.dealSnapshot,
          active_sheet: 'parties',
          dealId: req.params._id, // eslint-disable-line no-underscore-dangle
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

        await caseController.getCaseParties(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET party edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
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

      it('should render edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
          },
          session,
        };

        await caseController.getExporterPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/edit/exporter-edit.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: req.params._id, // eslint-disable-line no-underscore-dangle
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

        await caseController.getExporterPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET bond issuer edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
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

      it('should render bond edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
          },
          session,
        };

        await caseController.getBondIssuerPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/edit/bonds-issuer-edit.njk',
          {
            deal: mockDeal.dealSnapshot,
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

        await caseController.getBondIssuerPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET bond beneficiary edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
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

      it('should render bond edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
          },
          session,
        };

        await caseController.getBondBeneficiaryPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/edit/bonds-beneficiary-edit.njk',
          {
            deal: mockDeal.dealSnapshot,
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

        await caseController.getBondBeneficiaryPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST party edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render bond edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
          },
          body: {
            exporter: {
              partyUrn: '12345',
            },
          },
          session,
        };

        await caseController.postExporterPartyDetails(req, res);
        // eslint-disable-next-line no-underscore-dangle
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
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

        await caseController.postExporterPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST bond edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render bond edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
          },
          body: {
            facilityId: [1, 2],
            bondIssuerPartyUrn: [123, 234],
          },
          session,
        };

        await caseController.postTfmFacility(req, res);
        // eslint-disable-next-line no-underscore-dangle
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
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
          body: {},
          session,
        };

        await caseController.postTfmFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });
});
