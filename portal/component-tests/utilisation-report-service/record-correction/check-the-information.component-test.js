const { CURRENCY } = require('@ukef/dtfs2-common');
const pageRenderer = require('../../pageRenderer');
const {
  aUtilisationReportCorrectionInformationViewModel,
} = require('../../../test-helpers/test-data/view-models/record-corrections/utilisation-report-correction-information-view-model');

const page = 'utilisation-report-service/record-correction/check-the-information.njk';
const render = pageRenderer(page);

const definitionDescriptionSelector = (containerSelector, definitionTerm) => `${containerSelector} dt:contains("${definitionTerm}") + dd`;

describe('page', () => {
  const originalValuesSelector = '[data-cy="original-values-summary-list"]';
  const recordCorrectionDetailsSelector = '[data-cy="record-correction-details-summary-list"]';

  it('should render the page heading', () => {
    // Arrange
    const viewModel = aUtilisationReportCorrectionInformationViewModel();

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('h1[data-cy="main-heading"]').toRead('Record correction');
    wrapper.expectText('h2[data-cy="check-the-information-heading"]').toRead('Check the information before submitting the record correction');
  });

  it('should render the original values table heading', () => {
    // Arrange
    const viewModel = aUtilisationReportCorrectionInformationViewModel();

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('h3[data-cy="original-values-heading"]').toRead('Original values');
  });

  it('should render the exporter', () => {
    // Arrange
    const exporter = 'Sample Company Ltd';
    const viewModel = aUtilisationReportCorrectionInformationViewModel();
    viewModel.feeRecord.exporter = exporter;

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector(originalValuesSelector, 'Exporter')).toRead(exporter);
  });

  it('should render the original reported currency', () => {
    // Arrange
    const reportedCurrency = CURRENCY.GBP;
    const viewModel = aUtilisationReportCorrectionInformationViewModel();
    viewModel.feeRecord.reportedFees.currency = reportedCurrency;

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector(originalValuesSelector, 'Currency')).toRead(reportedCurrency);
  });

  it('should render the original reported fees', () => {
    // Arrange
    const reportedFees = 12345.67;
    const viewModel = aUtilisationReportCorrectionInformationViewModel();
    viewModel.feeRecord.reportedFees.amount = reportedFees;

    const expectedReportedFees = '12345.67';

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector(originalValuesSelector, 'Reported fees')).toRead(expectedReportedFees);
  });

  it('should render the record correction details table heading', () => {
    // Arrange
    const viewModel = aUtilisationReportCorrectionInformationViewModel();

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('h3[data-cy="record-correction-details-heading"]').toRead('Record correction details');
  });

  it('should render the formatted correction reasons', () => {
    // Arrange
    const formattedReasons = 'Reason 1, Reason 2';
    const viewModel = {
      ...aUtilisationReportCorrectionInformationViewModel(),
      formattedReasons,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector(recordCorrectionDetailsSelector, 'Error type(s)')).toRead(formattedReasons);
  });

  it('should render the "error summary" text without line breaks', () => {
    // Arrange
    const errorSummary = 'An error summary from PDC.';
    const viewModel = {
      ...aUtilisationReportCorrectionInformationViewModel(),
      errorSummary,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector(recordCorrectionDetailsSelector, 'Error summary')).toRead(errorSummary);
  });

  it('should render the "error summary" text with line breaks', () => {
    // Arrange
    const errorSummary = 'First line\n\nAnother line';
    const viewModel = {
      ...aUtilisationReportCorrectionInformationViewModel(),
      errorSummary,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    const expectedContent = 'First line<br><br>Another line';
    wrapper.expectElement(definitionDescriptionSelector(recordCorrectionDetailsSelector, 'Error summary')).toHaveHtmlContent(expectedContent);
  });

  it('should render the formatted old values', () => {
    // Arrange
    const formattedOldValues = 'Old Value 1, Old Value 2';
    const viewModel = {
      ...aUtilisationReportCorrectionInformationViewModel(),
      formattedOldValues,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector(recordCorrectionDetailsSelector, 'Old value(s)')).toRead(formattedOldValues);
  });

  it('should render the formatted new values', () => {
    // Arrange
    const formattedNewValues = 'New Value 1, New Value 2';
    const viewModel = {
      ...aUtilisationReportCorrectionInformationViewModel(),
      formattedNewValues,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector(recordCorrectionDetailsSelector, 'New value(s)')).toRead(formattedNewValues);
  });

  it('should render the "new values" change link', () => {
    // Arrange
    const backLinkHref = '/utilisation-reports/provide-correction/7';
    const viewModel = {
      ...aUtilisationReportCorrectionInformationViewModel(),
      backLinkHref,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectLink('[data-cy="change-record-correction-new-values-link"]').toLinkTo(backLinkHref, 'Change new values for record correction');
  });

  it('should render the "bank commentary" text without line breaks', () => {
    // Arrange
    const bankCommentary = 'Some bank commentary.';
    const viewModel = {
      ...aUtilisationReportCorrectionInformationViewModel(),
      bankCommentary,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector(recordCorrectionDetailsSelector, 'Bank commentary')).toRead(bankCommentary);
  });

  it('should render the "bank commentary" text with line breaks', () => {
    // Arrange
    const bankCommentary = 'First line\n\nAnother line';
    const viewModel = {
      ...aUtilisationReportCorrectionInformationViewModel(),
      bankCommentary,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    const expectedContent = 'First line<br><br>Another line';
    wrapper.expectElement(definitionDescriptionSelector(recordCorrectionDetailsSelector, 'Bank commentary')).toHaveHtmlContent(expectedContent);
  });

  it('should render the "bank commentary" change link', () => {
    // Arrange
    const backLinkHref = '/utilisation-reports/provide-correction/7';
    const viewModel = {
      ...aUtilisationReportCorrectionInformationViewModel(),
      backLinkHref,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectLink('[data-cy="change-record-correction-bank-commentary-link"]').toLinkTo(backLinkHref, 'Change bank commentary for record correction');
  });

  it('should render send request button', () => {
    // Act
    const wrapper = render(aUtilisationReportCorrectionInformationViewModel());

    // Assert
    wrapper.expectElement('[data-cy="continue-button"]').toExist();
    wrapper.expectText('[data-cy="continue-button"]').toRead('Confirm and send');
  });

  it('should render cancel button', () => {
    // Arrange
    const viewModel = aUtilisationReportCorrectionInformationViewModel();

    // Act
    const wrapper = render(viewModel);

    // Assert
    const cancelButtonSelector = '[data-cy="cancel-button"]';
    wrapper.expectElement(cancelButtonSelector).toExist();
    wrapper.expectText(cancelButtonSelector).toRead('Cancel record correction');
    wrapper.expectElement(cancelButtonSelector).hasClass('govuk-button--secondary');
    wrapper.expectElement(cancelButtonSelector).toHaveAttribute('href', '/utilisation-report-upload');
  });
});
