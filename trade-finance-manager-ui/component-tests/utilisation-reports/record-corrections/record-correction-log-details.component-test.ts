import { RECORD_CORRECTION_DISPLAY_STATUS, RECORD_CORRECTION_STATUS } from '@ukef/dtfs2-common';
import { RecordCorrectionLogDetailsViewModel } from '../../../server/types/view-models';
import { aCreateRecordCorrectionLogDetailsViewModel } from '../../../test-helpers/test-data/view-models';
import { pageRenderer } from '../../pageRenderer';

const page = '../templates/utilisation-reports/record-corrections/record-correction-log-details.njk';
const render = pageRenderer(page);

const definitionDescriptionSelector = (definitionTerm: string) => `[data-cy="summary-list"] dt:contains("${definitionTerm}") + dd`;

describe(page, () => {
  const getWrapper = (viewModel: RecordCorrectionLogDetailsViewModel = aCreateRecordCorrectionLogDetailsViewModel()) => render(viewModel);

  it('should render the main heading', () => {
    // Arrange
    const bankName = 'Test bank';
    const formattedReportPeriod = 'January 2023';

    const viewModel: RecordCorrectionLogDetailsViewModel = {
      ...aCreateRecordCorrectionLogDetailsViewModel(),
      bankName,
      formattedReportPeriod,
    };

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText('h1[data-cy="main-heading"]').toRead('Record correction log');
    wrapper.expectText('span[data-cy="heading-caption"]').toRead(`${bankName}, ${formattedReportPeriod}`);
  });

  it('should render a record correction status tag', () => {
    // Arrange
    const status = RECORD_CORRECTION_STATUS.SENT;
    const displayStatus = RECORD_CORRECTION_DISPLAY_STATUS.SENT;

    const viewModel: RecordCorrectionLogDetailsViewModel = {
      ...aCreateRecordCorrectionLogDetailsViewModel(),
      status,
      displayStatus,
    };

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText('[data-cy="record-correction-status"]').toRead(displayStatus);
  });

  it('should render the exporter', () => {
    // Arrange
    const exporter = 'An exporter';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.exporter = exporter;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Exporter')).toRead(exporter);
  });

  it('should render the facility id', () => {
    // Arrange
    const facilityId = '1111111';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.facilityId = facilityId;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Facility ID')).toRead(facilityId);
  });

  it('should render the date sent', () => {
    // Arrange
    const formattedDateSent = '10 Feb 2024';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.formattedDateSent = formattedDateSent;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Date sent')).toRead(formattedDateSent);
  });

  it('should render the contact name', () => {
    // Arrange
    const bankTeamName = 'A bank team name';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.bankTeamName = bankTeamName;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Contact name')).toRead(bankTeamName);
  });

  it('should render the contact email addresses with line breaks', () => {
    // Arrange
    const bankTeamEmails = ['one@ukexportfinance.gov.uk', 'two@ukexportfinance.gov.uk'];

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.bankTeamEmails = bankTeamEmails;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    const emailsSelector = `${definitionDescriptionSelector('Contact email address(es)')}`;
    wrapper.expectElement(emailsSelector).hasClass('ukef-word-break-break-all');

    const emailsContentSelector = `${emailsSelector} span`;
    const expectedContent = 'one@ukexportfinance.gov.uk,<br>two@ukexportfinance.gov.uk';
    wrapper.expectElement(emailsContentSelector).toHaveHtmlContent(expectedContent);
  });

  it("should render the requesting user's first and last names", () => {
    // Arrange
    const formattedRequestedByUser = 'Jay Smith';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.formattedRequestedByUser = formattedRequestedByUser;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Requested by')).toRead(formattedRequestedByUser);
  });

  it('should render the reasons for correction', () => {
    // Arrange
    const formattedReasons = 'Other';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.formattedReasons = formattedReasons;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Reason(s) for correction')).toRead(formattedReasons);
  });

  it('should render the additional information', () => {
    // Arrange
    const additionalInfo = 'Some additional information from PDC.';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.additionalInfo = additionalInfo;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Additional information')).toRead(additionalInfo);
  });

  it('should render the old records', () => {
    // Arrange
    const formattedOldRecords = 'Old value 1';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.formattedOldRecords = formattedOldRecords;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Old record(s)')).toRead(formattedOldRecords);
  });

  it('should render the correct records', () => {
    // Arrange
    const formattedCorrectRecords = 'Corrected value 1';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.formattedCorrectRecords = formattedCorrectRecords;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('New record')).toRead(formattedCorrectRecords);
  });

  it('should render the bank commentary', () => {
    // Arrange
    const formattedBankCommentary = 'Some commentary from the bank.';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.formattedBankCommentary = formattedBankCommentary;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Bank commentary')).toRead(formattedBankCommentary);
  });

  it('should render the date correction received', () => {
    // Arrange
    const formattedDateReceived = '11 Feb 2024';

    const viewModel = aCreateRecordCorrectionLogDetailsViewModel();
    viewModel.correctionDetails.formattedDateReceived = formattedDateReceived;

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Date correction received')).toRead(formattedDateReceived);
  });

  it('should render the back link', () => {
    // Arrange
    const backLinkHref = 'some-link-href';

    const viewModel: RecordCorrectionLogDetailsViewModel = {
      ...aCreateRecordCorrectionLogDetailsViewModel(),
      backLinkHref,
    };

    // Act
    const wrapper = getWrapper(viewModel);

    // Assert
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(backLinkHref, 'Back');
  });
});
