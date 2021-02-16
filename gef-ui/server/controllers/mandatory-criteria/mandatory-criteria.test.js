import { getMandatoryCriteria } from '.'
import * as Api from '../../services/api'


const mockResponse = () => {
  const res = {}
  res.redirect = jest.fn()
  res.render = jest.fn()
  return res
}

const response = mockResponse()

describe('Mandatory Criteria - Controller', () => {
  describe('GET Mandatory Criteria', () => {
    describe('When criteria exists', () => {
      const mockCriteria = {
        mockedText: 'This is a test',
      }

      beforeEach(() => {
        Api.getMandatoryCriteria = () => Promise.resolve(mockCriteria);
      })

      it('renders the `mandatory-criteria` template', async () => {
        await getMandatoryCriteria({}, response)
        expect(response.render).toHaveBeenCalledWith('templates/mandatory-criteria.njk', {
          criteria: mockCriteria
        });
      });
    });

    // describe('when deal does NOT exist', () => {
    //   beforeEach(() => {
    //     api.getDeal = () => Promise.resolve();
    //   });

    //   it('should redirect to not-found route', async () => {
    //     const req = {
    //       params: {
    //         _id: '1',
    //       },
    //     };

    //     await caseController.getCaseDeal(req, res);
    //     expect(res.redirect).toHaveBeenCalledWith('/not-found');
    //   });
    // });
  });

  // describe('GET case facility', () => {
  //   describe('when facility exists', () => {
  //     const mockFacility = {
  //       _id: '1000023',
  //       mock: true,
  //     };

  //     beforeEach(() => {
  //       api.getFacility = () => Promise.resolve(mockFacility);
  //     });

  //     it('should render deal template with data', async () => {
  //       const req = {
  //         params: {
  //           _id: mockFacility._id, // eslint-disable-line no-underscore-dangle
  //         },
  //       };

  //       await caseController.getCaseFacility(req, res);
  //       expect(res.render).toHaveBeenCalledWith('case/facility/facility.njk', {
  //         facility: mockFacility,
  //         active_sheet: 'facility',
  //         facilityId: req.params._id, // eslint-disable-line no-underscore-dangle
  //       });
  //     });
  //   });

  //   describe('when deal does NOT exist', () => {
  //     beforeEach(() => {
  //       api.getFacility = () => Promise.resolve();
  //     });

  //     it('should redirect to not-found route', async () => {
  //       const req = {
  //         params: {
  //           _id: '1',
  //         },
  //       };

  //       await caseController.getCaseFacility(req, res);
  //       expect(res.redirect).toHaveBeenCalledWith('/not-found');
  //     });
  //   });
  // });


  // describe('GET case parties', () => {
  //   describe('when deal exists', () => {
  //     const mockDeal = {
  //       _id: '1000023',
  //       mock: true,
  //     };

  //     beforeEach(() => {
  //       api.getDeal = () => Promise.resolve(mockDeal);
  //     });

  //     it('should render deal template with data', async () => {
  //       const req = {
  //         params: {
  //           _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
  //         },
  //       };

  //       await caseController.getCaseParties(req, res);
  //       expect(res.render).toHaveBeenCalledWith('case/parties/parties.njk', {
  //         deal: mockDeal,
  //         active_sheet: 'parties',
  //         dealId: req.params._id, // eslint-disable-line no-underscore-dangle
  //       });
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
  //       };

  //       await caseController.getCaseParties(req, res);
  //       expect(res.redirect).toHaveBeenCalledWith('/not-found');
  //     });
  //   });
  // });
});
