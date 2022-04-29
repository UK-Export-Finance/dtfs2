import { add, format } from 'date-fns';

import api from '../../../api';
import { mockRes } from '../../../test-mocks';

import amendmentsController from '.';

const CONSTANTS = require('../../../constants');

const res = mockRes();

const user = {
  _id: '12345678',
  username: 'testUser',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['PIM'],
};

const session = { user };

describe('controllers - case - amendments', () => {
  describe('GET getAmendmentRequest', () => {
    describe('when facility exists', () => {
      const mockFacility = {
        _id: '12345',
        facilitySnapshot: {
          _id: '12345',
          dealId: '4567',
        },
        amendments: [],
      };

      beforeEach(() => {
        api.getFacility = () => Promise.resolve(mockFacility);
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            facilityId: mockFacility._id,
          },
          session,
        };

        await amendmentsController.getAmendmentRequestDate(req, res);
        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-request.njk', {
          dealId: mockFacility.facilitySnapshot.dealId,
          facility: mockFacility,
          facilityId: mockFacility._id,
          user,
        });
      });
    });

    describe('when facility does NOT exist', () => {
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

        await amendmentsController.getAmendmentRequestDate(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST postAmendmentRequest', () => {
    describe('', () => {
      const mockFacility = {
        _id: '625e99cb88eeeb001e33bf4b',
        facilitySnapshot: {
          _id: '625e99cb88eeeb001e33bf4b',
          dealId: '4567',
          dates: {
            inclusionNoticeReceived: 1650538933299,
          },
        },
        amendments: [],
      };

      beforeEach(() => {
        api.getFacility = () => Promise.resolve(mockFacility);
      });

      it('should render template with errors if no date', async () => {
        const req = {
          params: {
            facilityId: mockFacility._id,
          },
          session,
          body: {
            'amendment-request-date-day': '',
            'amendment-request-date-month': '',
            'amendment-request-date-year': '',
          },
        };

        await amendmentsController.postAmendmentRequestDate(req, res);
        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-request.njk', {
          dealId: mockFacility.facilitySnapshot.dealId,
          facility: mockFacility,
          facilityId: mockFacility._id,
          user,
          amendmentRequestDateDay: '',
          amendmentRequestDateMonth: '',
          amendmentRequestDateYear: '',
          errors: {
            errorSummary: [
              {
                href: '#amendmentRequestDate',
                text: 'Enter the date the bank requested the amendment',
              },
            ],
            fieldErrors: {
              amendmentRequestDate: {
                text: 'Enter the date the bank requested the amendment',
              },
            },
          },
        });
      });

      it('should render template with errors before submission date', async () => {
        const req = {
          params: {
            facilityId: mockFacility._id,
          },
          session,
          body: {
            'amendment-request-date-day': '5',
            'amendment-request-date-month': '04',
            'amendment-request-date-year': '2022',
          },
        };

        await amendmentsController.postAmendmentRequestDate(req, res);
        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-request.njk', {
          dealId: mockFacility.facilitySnapshot.dealId,
          facility: mockFacility,
          facilityId: mockFacility._id,
          user,
          amendmentRequestDateDay: '5',
          amendmentRequestDateMonth: '04',
          amendmentRequestDateYear: '2022',
          errors: {
            errorSummary: [
              {
                href: '#amendmentRequestDate',
                text: 'Amendment request date cannot be before the notice submission date',
              },
            ],
            fieldErrors: {
              amendmentRequestDate: {
                text: 'Amendment request date cannot be before the notice submission date',
              },
            },
          },
        });
      });

      it('should render template with errors if amendment request date in the future', async () => {
        const today = new Date();
        const future = add(today, { days: 7 });

        const futureDay = format(future, 'dd');
        const futureMonth = format(future, 'MM');
        const futureYear = format(future, 'yyyy');

        const req = {
          params: {
            facilityId: mockFacility._id,
            amendmentId: '626bae8c43c01e02076352e1',
          },
          session,
          body: {
            'amendment-request-date-day': futureDay.toString(),
            'amendment-request-date-month': futureMonth.toString(),
            'amendment-request-date-year': futureYear.toString(),
          },
        };

        await amendmentsController.postAmendmentRequestDate(req, res);
        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-request.njk', {
          dealId: mockFacility.facilitySnapshot.dealId,
          facility: mockFacility,
          facilityId: mockFacility._id,
          user,
          amendmentRequestDateDay: futureDay.toString(),
          amendmentRequestDateMonth: futureMonth.toString(),
          amendmentRequestDateYear: futureYear.toString(),
          errors: {
            errorSummary: [
              {
                href: '#amendmentRequestDate',
                text: 'Amendment request date cannot be in the future',
              },
            ],
            fieldErrors: {
              amendmentRequestDate: {
                text: 'Amendment request date cannot be in the future',
              },
            },
          },
        });
      });

      it('should render template with no errors if valid date', async () => {
        const update = {
          createdAmendment: {
            amendments: {
              _id: '11111',
              status: CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS,
            },
          },
        };
        api.getFacility = () => Promise.resolve(mockFacility);
        api.createFacilityAmendment = () => Promise.resolve(update);

        const today = new Date();

        const todayDay = format(today, 'dd');
        const todayMonth = format(today, 'MM');
        const todayYear = format(today, 'yyyy');

        const req = {
          params: {
            facilityId: mockFacility._id,
            amendmentId: '626bae8c43c01e02076352e1',
          },
          session,
          body: {
            'amendment-request-date-day': todayDay.toString(),
            'amendment-request-date-month': todayMonth.toString(),
            'amendment-request-date-year': todayYear.toString(),
          },
        };

        await amendmentsController.postAmendmentRequestDate(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockFacility.facilitySnapshot.dealId}/facility/${mockFacility._id}/amendment/626bae8c43c01e02076352e1/request-date`);
      });
    });
  });
});
