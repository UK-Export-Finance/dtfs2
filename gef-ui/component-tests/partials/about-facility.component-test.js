const pageRenderer = require('../pageRenderer');
const { FACILITY_TYPE } = require('../../server/constants');

const page = 'partials/about-facility.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const facilityName = 'some facility name';
  const monthsOfCover = '6';
  const coverStartDateDay = '1';
  const coverStartDateMonth = '2';
  const coverStartDateYear = '1970';
  const coverEndDateDay = '3';
  const coverEndDateMonth = '4';
  const coverEndDateYear = '1971';
  const dealId = '61e54dd5b578247e14575882';
  const facilityId = '666862d9140a08222cbd69e7';

  const params = {
    facilityType: FACILITY_TYPE.CASH,
    facilityName,
    hasBeenIssued: false,
    monthsOfCover,
    shouldCoverStartOnSubmission: null,
    coverStartDateDay,
    coverStartDateMonth,
    coverStartDateYear,
    coverEndDateDay,
    coverEndDateMonth,
    coverEndDateYear,
    facilityTypeString: FACILITY_TYPE.CASH.toLowerCase(),
    dealId,
    facilityId,
    status: null,
    isFacilityEndDateEnabled: true,
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it(`only renders the 'Back to previous page' link if the status does not equal 'change'`, () => {
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(`/gef/application-details/${dealId}/facilities/${facilityId}`, 'Back to previous page');

    wrapper = render({
      ...params,
      status: 'change',
    });

    wrapper.expectLink('[data-cy="back-link"]').notToExist();
  });

  it(`renders the 'Add a facility' heading caption`, () => {
    wrapper.expectText('[data-cy="heading-caption"]').toRead(`Add a facility`);
  });

  it('renders the facility name input', () => {
    wrapper.expectInput('[data-cy="facility-name"]').toHaveValue(facilityName);
  });

  describe('with the facility end date enabled', () => {
    beforeEach(() => {
      wrapper = render({ ...params, isFacilityEndDateEnabled: true });
    });

    it(`renders the 'What is a facility end date' details`, () => {
      wrapper.expectText('[data-cy="facility-end-date-details"] span').toRead('What is a facility end date');
      wrapper
        .expectText('[data-cy="facility-end-date-details"] div')
        .toRead('The facility end date is the deadline for a committed loan to be repaid at which point the contract will be terminated.');
    });

    it(`renders the 'Do you have a facility end date?' question`, () => {
      wrapper.expectText('.govuk-fieldset__legend--m').toRead('Do you have a facility end date?');
      wrapper.expectInput('[data-cy="is-using-facility-end-date-yes"]').toNotBeChecked();
      wrapper.expectInput('[data-cy="is-using-facility-end-date-no"]').toNotBeChecked();
    });
  });

  describe('with the facility end date disabled', () => {
    beforeEach(() => {
      wrapper = render({ ...params, isFacilityEndDateEnabled: false });
    });

    it(`does not render the 'What is a Facility End Date' details`, () => {
      wrapper.expectElement('[data-cy="facility-end-date-details"]').notToExist();
    });

    it(`does not render the 'Do you have a facility end date?' radio buttons`, () => {
      wrapper.expectElement('[data-cy="is-using-facility-end-date-yes"]').notToExist();
      wrapper.expectElement('[data-cy="is-using-facility-end-date-no"]').notToExist();
    });
  });

  it(`renders the 'Continue' button`, () => {
    wrapper.expectText('[data-cy="continue-button"]').toRead('Continue');
  });

  it(`renders the 'Save and return' button`, () => {
    wrapper.expectText('[data-cy="save-and-return-button"]').toRead('Save and return');
    wrapper.expectElement('[data-cy="save-and-return-button"]').toHaveAttribute('formaction', 'about-facility?saveAndReturn=true');
  });

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

    it('renders the correct main heading', () => {
      wrapper.expectText('[data-cy="main-heading"]').toRead(`About this ${facilityTypeString} facility`);
    });

    it('renders the correct prompt for the facility name input', () => {
      wrapper.expectText('[data-cy="facility-name-label"]').toRead(`Enter a name for this ${facilityTypeString} facility (optional)`);
    });
  });

  describe.each([
    {
      hasBeenIssued: false,
      issuedStatusString: 'unissued',
    },
    {
      hasBeenIssued: true,
      issuedStatusString: 'issued',
    },
  ])('for a $issuedStatusString facility', ({ hasBeenIssued }) => {
    beforeEach(() => {
      wrapper = render({
        ...params,
        hasBeenIssued,
      });
    });

    it('renders the correct prompt for the facility name input', () => {
      wrapper.expectText('[data-cy="facility-name-label"]').toRead(`Enter a name for this cash facility${hasBeenIssued ? '' : ' (optional)'}`);
    });

    if (hasBeenIssued) {
      it(`renders the 'Do you want UKEF cover to start on the day you submit the automatic inclusion notice?' question with radio buttons`, () => {
        wrapper.expectText('.govuk-fieldset__legend--m').toContain('Do you want UKEF cover to start on the day you submit the automatic inclusion notice?');
        wrapper.expectInput('[data-cy="should-cover-start-on-submission-yes"]').toNotBeChecked();
        wrapper.expectInput('[data-cy="should-cover-start-on-submission-no"]').toNotBeChecked();
      });

      it(`renders the 'Enter a cover start date' prompt, hint and date input`, () => {
        wrapper.expectText('[aria-describedby="coverStartDate-hint"] legend').toRead('Enter a cover start date');
        wrapper
          .expectText('#coverStartDate-hint')
          .toContain(
            `This must be within three calendar months after the date you submit the notice to UKEF. It cannot be earlier than the date it's submitted.`,
          );
        wrapper
          .expectText('#coverStartDate-hint')
          .toContain(
            'If your cover start date expires by the time the notice is submitted, your cover will start on the date your notice is submitted to UKEF.',
          );
        wrapper.expectInput('[data-cy="cover-start-date-day"]').toHaveValue(coverStartDateDay);
        wrapper.expectInput('[data-cy="cover-start-date-month"]').toHaveValue(coverStartDateMonth);
        wrapper.expectInput('[data-cy="cover-start-date-year"]').toHaveValue(coverStartDateYear);
      });

      it(`only displays the 'Enter a cover start date' prompt, hint and date input if 'Do you want UKEF cover to start on the day you submit the automatic inclusion notice?' is answered 'No'`, () => {
        wrapper.expectElement('#conditional-shouldCoverStartOnSubmission-2').hasClass('govuk-radios__conditional--hidden');

        wrapper = render({
          ...params,
          hasBeenIssued,
          shouldCoverStartOnSubmission: 'false',
        });

        wrapper.expectInput('[data-cy="should-cover-start-on-submission-no"]').toBeChecked();
        wrapper.expectInput('[data-cy="should-cover-start-on-submission-yes"]').toNotBeChecked();
        wrapper.expectElement('#conditional-shouldCoverStartOnSubmission-2').doesNotHaveClass('govuk-radios__conditional--hidden');
      });

      it(`renders the 'When do you want the UKEF cover to end?' question, hint and date input`, () => {
        wrapper.expectText('[aria-describedby="coverEndDate-hint"] legend').toRead('When do you want the UKEF cover to end?');
        wrapper.expectText('#coverEndDate-hint').toRead('For example, 12 03 2021.');
        wrapper.expectInput('[data-cy="cover-end-date-day"]').toHaveValue(coverEndDateDay);
        wrapper.expectInput('[data-cy="cover-end-date-month"]').toHaveValue(coverEndDateMonth);
        wrapper.expectInput('[data-cy="cover-end-date-year"]').toHaveValue(coverEndDateYear);
      });
    } else {
      it(`renders the 'How many months will you need UKEF cover for?' question, hint and number of months input`, () => {
        wrapper.expectText('[for="monthsOfCover"]').toRead('How many months will you need UKEF cover for?');
        wrapper.expectText('#monthsOfCover-hint').toRead('Round up to the nearest number of months');
        wrapper.expectInput('[data-cy="months-of-cover"]').toHaveValue(monthsOfCover);
        wrapper.expectText('.govuk-input__suffix').toRead('months');
      });
    }
  });
});
