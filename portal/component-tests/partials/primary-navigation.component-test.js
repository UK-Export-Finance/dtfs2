const { ROLES } = require('@ukef/dtfs2-common');
const pageRenderer = require('../pageRenderer');

const page = '_partials/primary-navigation.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  describe(`viewed by role '${ROLES.MAKER}'`, () => {
    beforeAll(() => {
      wrapper = render({ user: { roles: [ROLES.MAKER] } });
    });

    itRendersAHomeLink();
    itRendersAReportsLink();

    itDoesNotRenderAUtilisationReportUploadLink();
    itDoesNotRenderAPreviousReportsLink();
    itDoesNotRenderAUsersLink();
  });

  describe(`viewed by role '${ROLES.CHECKER}'`, () => {
    beforeAll(() => {
      wrapper = render({ user: { roles: [ROLES.CHECKER] } });
    });

    itRendersAHomeLink();
    itRendersAReportsLink();

    itDoesNotRenderAUtilisationReportUploadLink();
    itDoesNotRenderAPreviousReportsLink();
    itDoesNotRenderAUsersLink();
  });

  describe(`viewed by role '${ROLES.ADMIN}'`, () => {
    beforeAll(() => {
      wrapper = render({ user: { roles: [ROLES.ADMIN] } });
    });

    itRendersAHomeLink();
    itRendersAReportsLink();
    itRendersAUsersLink();

    itDoesNotRenderAUtilisationReportUploadLink();
    itDoesNotRenderAPreviousReportsLink();
  });

  describe(`viewed by role '${ROLES.READ_ONLY}'`, () => {
    beforeAll(() => {
      wrapper = render({ user: { roles: [ROLES.READ_ONLY] } });
    });

    itRendersAHomeLink();

    itDoesNotRenderAReportsLink();
    itDoesNotRenderAUtilisationReportUploadLink();
    itDoesNotRenderAPreviousReportsLink();
    itDoesNotRenderAUsersLink();
  });

  describe(`viewed by role '${ROLES.PAYMENT_REPORT_OFFICER}'`, () => {
    beforeAll(() => {
      wrapper = render({ user: { roles: [ROLES.PAYMENT_REPORT_OFFICER] } });
    });

    itRendersAUtilisationReportUploadLink();
    itRendersAPreviousReportsLink();

    itDoesNotRenderAHomeLink();
    itDoesNotRenderAReportsLink();
    itDoesNotRenderAUsersLink();
  });

  describe('viewed with no roles', () => {
    beforeAll(() => {
      wrapper = render({ user: { roles: [] } });
    });

    itDoesNotRenderAHomeLink();
    itDoesNotRenderAReportsLink();
    itDoesNotRenderAUtilisationReportUploadLink();
    itDoesNotRenderAPreviousReportsLink();
    itDoesNotRenderAUsersLink();
  });

  function itRendersAHomeLink() {
    it('renders a home link', () => {
      wrapper.expectLink('[data-cy="dashboard"]').toLinkTo('/dashboard', 'Home');
    });
  }

  function itDoesNotRenderAHomeLink() {
    it('does not render a home link', () => {
      wrapper.expectLink('[data-cy="dashboard"]').notToExist();
    });
  }

  function itRendersAReportsLink() {
    it('renders a reports link', () => {
      wrapper.expectLink('[data-cy="reports"]').toLinkTo('/reports', 'Reports');
    });
  }

  function itDoesNotRenderAReportsLink() {
    it('does not render a reports link', () => {
      wrapper.expectLink('[data-cy="reports"]').notToExist();
    });
  }

  function itRendersAUtilisationReportUploadLink() {
    it('renders a utilisation report upload link', () => {
      wrapper.expectLink('[data-cy="upload_report"]').toLinkTo('/utilisation-report-upload', 'Report GEF utilisation and fees');
    });
  }

  function itDoesNotRenderAUtilisationReportUploadLink() {
    it('does not render a utilisation report upload link', () => {
      wrapper.expectLink('[data-cy="upload_report"]').notToExist();
    });
  }

  function itRendersAPreviousReportsLink() {
    it('renders a previous reports link', () => {
      wrapper.expectLink('[data-cy="previous_reports"]').toLinkTo('/previous-reports', 'Previous GEF reports');
    });
  }

  function itDoesNotRenderAPreviousReportsLink() {
    it('does not render a previous reports link', () => {
      wrapper.expectLink('[data-cy="previous_reports"]').notToExist();
    });
  }

  function itRendersAUsersLink() {
    it('renders a users link', () => {
      wrapper.expectLink('[data-cy="users"]').toLinkTo('/admin/users', 'Users');
    });
  }

  function itDoesNotRenderAUsersLink() {
    it('does not render a users link', () => {
      wrapper.expectLink('[data-cy="users"]').notToExist();
    });
  }
});
