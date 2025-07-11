const { ROLES } = require('@ukef/dtfs2-common');
const pageRenderer = require('../pageRenderer');

const page = '_partials/header.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  describe(`viewed by role '${ROLES.MAKER}'`, () => {
    beforeAll(() => {
      wrapper = render({ user: { roles: [ROLES.MAKER] } });
    });

    itRendersAHomeLink();
    itRendersAReportsLink();
    itRendersAProfileLink();
    itRendersASignOutLink();

    itDoesNotRenderAUtilisationReportUploadLink();
    itDoesNotRenderAPreviousReportsLink();
    itDoesNotRenderARecordCorrectionLogLink();
    itDoesNotRenderAUsersLink();
  });

  describe(`viewed by role '${ROLES.CHECKER}'`, () => {
    beforeAll(() => {
      wrapper = render({ user: { roles: [ROLES.CHECKER] } });
    });

    itRendersAHomeLink();
    itRendersAReportsLink();
    itRendersAProfileLink();
    itRendersASignOutLink();

    itDoesNotRenderAUtilisationReportUploadLink();
    itDoesNotRenderAPreviousReportsLink();
    itDoesNotRenderARecordCorrectionLogLink();
    itDoesNotRenderAUsersLink();
  });

  describe(`viewed by role '${ROLES.ADMIN}'`, () => {
    beforeAll(() => {
      wrapper = render({ user: { roles: [ROLES.ADMIN] } });
    });

    itRendersAHomeLink();
    itRendersAReportsLink();
    itRendersAUsersLink();
    itRendersAProfileLink();
    itRendersASignOutLink();

    itDoesNotRenderAUtilisationReportUploadLink();
    itDoesNotRenderAPreviousReportsLink();
    itDoesNotRenderARecordCorrectionLogLink();
  });

  describe(`viewed by role '${ROLES.READ_ONLY}'`, () => {
    beforeAll(() => {
      wrapper = render({ user: { roles: [ROLES.READ_ONLY] } });
    });

    itRendersAHomeLink();
    itRendersAProfileLink();
    itRendersASignOutLink();

    itDoesNotRenderAReportsLink();
    itDoesNotRenderAUtilisationReportUploadLink();
    itDoesNotRenderAPreviousReportsLink();
    itDoesNotRenderARecordCorrectionLogLink();
    itDoesNotRenderAUsersLink();
  });

  describe(`viewed by role '${ROLES.PAYMENT_REPORT_OFFICER}' and FF_FEE_RECORD_CORRECTION_ENABLED is set to "true"`, () => {
    const originalProcessEnv = { ...process.env };

    beforeAll(() => {
      process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'true';
      wrapper = render({ user: { roles: [ROLES.PAYMENT_REPORT_OFFICER] } });
    });

    afterAll(() => {
      process.env = originalProcessEnv;
    });

    itRendersAUtilisationReportUploadLink();
    itRendersAPreviousReportsLink();
    itRendersARecordCorrectionLogLink();
    itRendersAProfileLink();
    itRendersASignOutLink();

    itDoesNotRenderAHomeLink();
    itDoesNotRenderAReportsLink();
    itDoesNotRenderAUsersLink();
  });

  describe(`viewed by role '${ROLES.PAYMENT_REPORT_OFFICER}' and FF_FEE_RECORD_CORRECTION_ENABLED is set to "false"`, () => {
    const originalProcessEnv = { ...process.env };

    beforeAll(() => {
      process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'false';
      wrapper = render({ user: { roles: [ROLES.PAYMENT_REPORT_OFFICER] } });
    });

    afterAll(() => {
      process.env = originalProcessEnv;
    });

    itRendersAUtilisationReportUploadLink();
    itRendersAPreviousReportsLink();
    itDoesNotRenderARecordCorrectionLogLink();
    itRendersAProfileLink();
    itRendersASignOutLink();

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
    itDoesNotRenderARecordCorrectionLogLink();
    itDoesNotRenderAUsersLink();
    itDoesNotRendersAProfileLink();
    itDoesNotRendersASignOutLink();
  });

  function itRendersAHomeLink() {
    it('renders a home link', () => {
      wrapper.expectLink('[data-cy="dashboard-header"]').toLinkTo('/dashboard', 'Dashboard');
    });
  }

  function itDoesNotRenderAHomeLink() {
    it('does not render a home link', () => {
      wrapper.expectLink('[data-cy="dashboard-header"]').notToExist();
    });
  }

  function itRendersAReportsLink() {
    it('renders a reports link', () => {
      wrapper.expectLink('[data-cy="reports-header"]').toLinkTo('/reports', 'Reports');
    });
  }

  function itDoesNotRenderAReportsLink() {
    it('does not render a reports link', () => {
      wrapper.expectLink('[data-cy="reports-header"]').notToExist();
    });
  }

  function itRendersAUtilisationReportUploadLink() {
    it('renders a utilisation report upload link', () => {
      wrapper.expectLink('[data-cy="upload-report-header"]').toLinkTo('/utilisation-report-upload', 'Report GEF utilisation and fees');
    });
  }

  function itDoesNotRenderAUtilisationReportUploadLink() {
    it('does not render a utilisation report upload link', () => {
      wrapper.expectLink('[data-cy="upload-report-header"]').notToExist();
    });
  }

  function itRendersAPreviousReportsLink() {
    it('renders a previous reports link', () => {
      wrapper.expectLink('[data-cy="previous-reports-header"]').toLinkTo('/previous-reports', 'Previous GEF reports');
    });
  }

  function itDoesNotRenderAPreviousReportsLink() {
    it('does not render a previous reports link', () => {
      wrapper.expectLink('[data-cy="previous-reports-header"]').notToExist();
    });
  }

  function itRendersARecordCorrectionLogLink() {
    it('renders a record correction log link', () => {
      wrapper.expectLink('[data-cy="record-correction-log-header"]').toLinkTo('/utilisation-reports/correction-log', 'Record correction log');
    });
  }

  function itDoesNotRenderARecordCorrectionLogLink() {
    it('does not render a record correction log link', () => {
      wrapper.expectLink('[data-cy="record-correction-log-header"]').notToExist();
    });
  }

  function itRendersAUsersLink() {
    it('renders a users link', () => {
      wrapper.expectLink('[data-cy="users-header"]').toLinkTo('/admin/users', 'Users');
    });
  }

  function itDoesNotRenderAUsersLink() {
    it('does not render a users link', () => {
      wrapper.expectLink('[data-cy="users-header"]').notToExist();
    });
  }

  function itRendersAProfileLink() {
    it('renders a profile link', () => {
      wrapper.expectLink('[data-cy="profile-header"]').toLinkTo('/user/undefined', 'Profile');
    });
  }

  function itDoesNotRendersAProfileLink() {
    it('does not renders a profile link', () => {
      wrapper.expectLink('[data-cy="profile-header"]').notToExist();
    });
  }

  function itRendersASignOutLink() {
    it('renders a sign out link', () => {
      wrapper.expectLink('[data-cy="logout-header"]').toLinkTo('/logout', 'Sign out');
    });
  }

  function itDoesNotRendersASignOutLink() {
    it('does not renders a sign out link', () => {
      wrapper.expectLink('[data-cy="logout-header"]').notToExist();
    });
  }
});
