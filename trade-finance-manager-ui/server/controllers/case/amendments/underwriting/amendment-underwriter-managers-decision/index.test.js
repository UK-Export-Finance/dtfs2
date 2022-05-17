import amendmentUnderwritersDecision from '.';
import { canUserEditManagersDecision } from '../helpers';
// import { validateSubmittedValues } from './validateSubmittedValues';
// import { mapDecisionObject } from './mapDecisionObject';
import api from '../../../../../api';
import { mockRes } from '../../../../../test-mocks';
import MOCKS from '../test-mocks/amendment-test-mocks';

const res = mockRes();

describe('getAmendmentUnderwriterManagersDecision()', () => {
  const isEditable = canUserEditManagersDecision(
    MOCKS.session.user,
    MOCKS.MOCK_AMENDMENT,
  );

  describe('when deal exists', () => {
    it('should return object with data', async () => {
      const result = await amendmentUnderwritersDecision.getAmendmentUnderwriterManagersDecision(
        MOCKS.MOCK_AMENDMENT_BY_PROGRESS,
        MOCKS.session.user,
      );

      expect(result).toEqual({
        isEditable,
        amendment: MOCKS.MOCK_AMENDMENT_BY_PROGRESS,
        dealId: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.dealId,
        facilityId: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.facilityId,
        amendmentId: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.amendmentId,
      });
    });
  });
});

describe('getAmendmentUnderwriterManagersDecisionEdit()', () => {
  describe('when deal exist and amendments exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL_NO_LEAD_UNDERWRITER);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
    });

    it('should render template with data if user can edit decision', async () => {
      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL_NO_LEAD_UNDERWRITER._id,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
          facilityId: '12345',
        },
        session: MOCKS.session,
      };

      await amendmentUnderwritersDecision.getAmendmentUnderwriterManagersDecisionEdit(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/underwriting/amendment-managers-decision/amendment-edit-managers-decision.njk', {
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        amendment: MOCKS.MOCK_AMENDMENT.amendments,
        isEditable: true,
        user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
      });
    });
  });

  describe('when user cannot edit (i.e, NOT in UNDERWRITER_MANAGERS team)', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL_NO_LEAD_UNDERWRITER);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
    });

    it('should render template with data with false userCanEdit', async () => {
      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL_NO_LEAD_UNDERWRITER._id,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
          facilityId: '12345',
        },
        session: {
          user: {
            ...MOCKS.session.user,
            teams: ['TEAM1'],
          },
        },
      };

      await amendmentUnderwritersDecision.getAmendmentUnderwriterManagersDecisionEdit(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/underwriting/amendment-managers-decision/amendment-edit-managers-decision.njk', {
        dealId: MOCKS.MOCK_DEAL_NO_LEAD_UNDERWRITER.dealSnapshot._id,
        amendment: MOCKS.MOCK_AMENDMENT.amendments,
        isEditable: false,
        user: req.session.user,
      });
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL_NO_LEAD_UNDERWRITER);
      api.getAmendmentById = () => Promise.resolve({ data: {} });
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session: MOCKS.session,
      };

      await amendmentUnderwritersDecision.getAmendmentUnderwriterManagersDecisionEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('when amendment does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session: MOCKS.session,
      };

      await amendmentUnderwritersDecision.getAmendmentUnderwriterManagersDecisionEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

// describe('POST underwriting - underwriting managers decision edit', () => {
//   describe('when there are NO validation errors', () => {
//     const apiUpdateSpy = jest.fn(() => Promise.resolve({
//       test: true,
//     }));

//     beforeEach(() => {
//       api.getDeal = () => Promise.resolve(mockDeal);
//       api.updateUnderwriterManagersDecision = apiUpdateSpy;
//     });

//     it('should call API and redirect to `/managers-decision` route', async () => {
//       const req = {
//         params: {
//           _id: dealId,
//         },
//         session,
//         body: {
//           decision: 'Approve without conditions',
//         },
//       };

//       await underwriterManagersDecisionController.postUnderwriterManagersDecision(req, res);

//       expect(apiUpdateSpy).toHaveBeenCalledWith(
//         dealId,
//         mapDecisionObject(req.body, req.session.user),
//       );

//       expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/underwriting`);
//     });
//   });

//   describe('when there are validation errors', () => {
//     beforeEach(() => {
//       api.getDeal = () => Promise.resolve(mockDeal);
//     });

//     it('should render template with validationErrors and submittedValues', async () => {
//       const req = {
//         params: {
//           _id: dealId,
//         },
//         session,
//         body: {
//           decision: 'Approve with conditions',
//         },
//       };

//       await underwriterManagersDecisionController.postUnderwriterManagersDecision(req, res);

//       expect(res.render).toHaveBeenCalledWith('case/underwriting/managers-decision/edit-managers-decision.njk', {
//         activePrimaryNavigation: 'manage work',
//         activeSubNavigation: 'underwriting',
//         deal: mockDeal.dealSnapshot,
//         tfm: mockDeal.tfm,
//         dealId: mockDeal.dealSnapshot._id,
//         user: session.user,
//         submittedValues: {
//           decision: 'Approve with conditions',
//         },
//         validationErrors: validateSubmittedValues(req.body),
//       });
//     });
//   });

//   describe('when user cannot edit (i.e, is NOT in UNDERWRITER_MANAGERS team)', () => {
//     it('should redirect to not-found route', async () => {
//       const req = {
//         params: {
//           _id: dealId,
//         },
//         session: {
//           user: {
//             ...session.user,
//             teams: ['TEAM1'],
//           },
//         },
//       };

//       await underwriterManagersDecisionController.postUnderwriterManagersDecision(req, res);

//       expect(res.redirect).toHaveBeenCalledWith('/not-found');
//     });
//   });

//   describe('when deal does NOT exist', () => {
//     beforeEach(() => {
//       api.getDeal = () => Promise.resolve();
//     });

//     it('should redirect to not-found route', async () => {
//       const req = {
//         params: {
//           _id: '1',
//         },
//         session,
//       };

//       await underwriterManagersDecisionController.postUnderwriterManagersDecision(req, res);
//       expect(res.redirect).toHaveBeenCalledWith('/not-found');
//     });
//   });
// });
