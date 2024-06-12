const pageRenderer = require('../pageRenderer');
const { FACILITY_TYPE } = require('../../server/constants');

const page = 'partials/about-facility.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const dealId = '61e54dd5b578247e14575882';
  const facilityId = '666862d9140a08222cbd69e7';

  const params = {
    facilityType: FACILITY_TYPE.CASH,
    facilityName: null,
    hasBeenIssued: false,
    monthsOfCover: null,
    shouldCoverStartOnSubmission: null,
    coverStartDateDay: null,
    coverStartDateMonth: null,
    coverStartDateYear: null,
    coverEndDateDay: null,
    coverEndDateMonth: null,
    coverEndDateYear: null,
    facilityTypeString: FACILITY_TYPE.CASH.toLowerCase(),
    dealId,
    facilityId,
    status: null,
  };

  describe.each([
    {
      facilityType: FACILITY_TYPE.CASH,
      facilityTypeString: FACILITY_TYPE.CASH.toLowerCase(),
    },
    {
      facilityType: FACILITY_TYPE.CONTINGENT,
      facilityTypeString: FACILITY_TYPE.CONTINGENT.toLowerCase(),
    },
  ])('for a $facilityTypeString facility', ({ facilityType, facilityTypeString }) => {
    beforeEach(() => {
      wrapper = render({
        ...params,
        facilityType,
        facilityTypeString,
      });
    });

    it('renders the correct heading', () => {
      wrapper.expectText('[data-cy="main-heading"]').toRead(`About this ${facilityTypeString} facility`);
    });
  });
});
