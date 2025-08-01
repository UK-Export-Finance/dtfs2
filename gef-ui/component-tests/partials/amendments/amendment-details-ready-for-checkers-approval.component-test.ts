import { FACILITY_TYPE, ROLES } from '@ukef/dtfs2-common';
import pageRenderer from '../../pageRenderer';
import { AmendmentDetailsViewModel } from '../../../server/types/view-models/amendments/amendment-details-view-model';

const page = 'partials/amendments/amendment-details.njk';
const render = pageRenderer(page);

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const users = [ROLES.MAKER, ROLES.CHECKER];

users.forEach((user) => {
  describe(`when the user is a ${user}`, () => {
    describe(page, () => {
      const previousPage = 'previousPage';
      const exporterName = 'exporterName';
      const facilityType = FACILITY_TYPE.CASH;
      const userRoles = [user];
      const submitAmendment = user.includes(ROLES.CHECKER);
      const effectiveDate = '25/07/2025';
      const banner = true;
      const canSubmitFacilityAmendmentToChecker = false;

      const params: AmendmentDetailsViewModel = {
        userRoles,
        exporterName,
        facilityType,
        submitAmendment,
        dealId,
        facilityId,
        amendmentId,
        canSubmitFacilityAmendmentToChecker,
        previousPage,
        effectiveDate,
        banner,
        amendmentSummaryListParams: {
          amendmentRows: [],
          eligibilityRows: [],
          effectiveDateRows: [],
        },
      };

      it('should render the page heading', () => {
        const wrapper = render(params);

        wrapper.expectText('[data-cy="page-heading"]').toContain('Amendment details');
      });

      it(`should render the 'Back' link`, () => {
        const wrapper = render(params);

        wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
      });

      it('should render the exporter name and facility type in the heading caption', () => {
        const wrapper = render(params);

        wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
      });

      it('should render a print button', () => {
        const wrapper = render(params);

        wrapper.expectText('[data-cy="print-button"]').toRead('Print page');
      });

      it('should render the information banner for effective date', () => {
        const wrapper = render(params);

        wrapper.expectElement('[data-cy="facility-information-banner"]').toExist();
      });

      it('should have the correct integrity for the print button', () => {
        const wrapper = render(params);

        wrapper
          .expectElement('script[src="/assets/js/printPage.js"]')
          .toHaveAttribute('integrity', 'sha512-COV1ZxdaFcvJFaLBxO/S9vxb6lx0vun8S4gYf82aSfr/OCjWt6yeEWTeaLYS2crz70vNnQEdoDEg9JojLHqU5A==');
      });

      it('should render amendment summary list', () => {
        const wrapper = render(params);

        wrapper.expectElement('[data-cy="amendment-summary-list"]').toExist();
      });

      it('should render eligibility summary list', () => {
        const wrapper = render(params);

        wrapper.expectElement('[data-cy="eligibility-summary-list"]').toExist();
      });

      it('should render effective date summary list', () => {
        const wrapper = render(params);

        wrapper.expectElement('[data-cy="effective-date-summary-list"]').toExist();
      });

      it('should render submit buttons', () => {
        const wrapper = render(params);

        if (user === ROLES.MAKER) {
          wrapper.expectElement('[data-cy="return-button"]').notToExist();
          wrapper.expectElement('[data-cy="submit-button"]').notToExist();
          wrapper.expectElement('[data-cy="abandon-button"]').notToExist();
        }

        if (user === ROLES.CHECKER) {
          wrapper.expectElement('[data-cy="submit-button"]').toExist();
          wrapper.expectText('[data-cy="submit-button"]').toRead('Submit to UKEF');
          wrapper.expectElement('[data-cy="return-button"]').toExist();
          wrapper.expectText('[data-cy="return-button"]').toRead('Return to maker');
        }
      });
    });
  });
});
