const { uploadPreviousUtilisationReports } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const relative = require('../../../relativeURL');

const { BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

context('Show overdue reports', () => {
  before(() => {
    const mockReports = [{
      bank: {
        id: '9',
        name: 'BANK1',
      },
      month: 1,
      year: 2023,
      uploadedDate: '2023-01-05T10:35:15Z',
      uploadedBy: {
        id: '00000',
        name: 'John Smith',
      },
      path: 'www.abc.com',
    }, {
      bank: {
        id: '9',
        name: 'BANK1',
      },
      month: 2,
      year: 2023,
      uploadedDate: '2023-02-06T11:30:10Z',
      uploadedBy: {
        id: '00001',
        name: 'John Smith',
      },
      path: 'www.abc.com',
    }, {
      bank: {
        id: '9',
        name: 'BANK1',
      },
      month: 3,
      year: 2023,
      uploadedDate: '22023-03-07T12:25:20Z',
      uploadedBy: {
        id: '00002',
        name: 'John Smith',
      },
      path: 'www.abc.com',
    }];

    cy.insertUtilisationReportDetails(mockReports);
  });

  after(() => {
    cy.removeAllUtilisationReportDetails();
  });

  it('should render to upload-previous-utilisation-report template when a report is overdue', () => {
    cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
    cy.visit(relative('/utilisation-report-upload'));

    uploadPreviousUtilisationReports.utilisationReportFileInput().should('exist');
    uploadPreviousUtilisationReports.continueButton().should('exist');
    uploadPreviousUtilisationReports.warningText().should('exist');
    uploadPreviousUtilisationReports.dueReportsList().should('exist');
  });
});
