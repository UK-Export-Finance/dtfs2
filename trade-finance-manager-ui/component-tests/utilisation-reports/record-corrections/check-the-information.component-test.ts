import { aRecordCorrectionRequestInformationViewModel } from '../../../test-helpers/test-data/view-models/record-corrections/record-correction-request-information-view-model';
import { RecordCorrectionRequestInformationViewModel } from '../../../server/types/view-models';
import { pageRenderer } from '../../pageRenderer';
import { aTfmSessionUser } from '../../../test-helpers';

const page = '../templates/utilisation-reports/record-corrections/check-the-information.njk';
const render = pageRenderer<RecordCorrectionRequestInformationViewModel>(page);

const definitionDescriptionSelector = (definitionTerm: string) => `[data-cy="summary-list"] dt:contains("${definitionTerm}") + dd`;

describe('page', () => {
  const reportId = '123';
  const feeRecordId = '456';

  it('should render the page heading', () => {
    // Arrange
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      bank: { name: 'Test bank' },
      formattedReportPeriod: 'May 2032',
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('h1').toRead('Check the information before submitting the record correction request');
    wrapper.expectText('span[data-cy="heading-caption"]').toRead('Test bank, May 2032');
  });

  it('should render the facility id', () => {
    // Arrange
    const facilityId = '0012345678';
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      facilityId,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Facility ID')).toRead(facilityId);
  });

  it('should render the exporter', () => {
    // Arrange
    const exporter = 'Sample Company Ltd';
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      exporter,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Exporter')).toRead(exporter);
  });

  it('should render the users name for the requested by field', () => {
    // Arrange
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      user: {
        ...aTfmSessionUser(),
        firstName: 'Jane',
        lastName: 'Smith',
      },
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Requested by')).toRead('Jane Smith');
  });

  it('should render the reason for record correction', () => {
    // Arrange
    const reason = 'a reason';
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      reasonForRecordCorrection: reason,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Reason for record correction')).toRead(reason);
  });

  it('should render the "reason for record correction" change link', () => {
    // Arrange
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      reportId,
      feeRecordId,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    const expectedHref = `/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}`;
    wrapper.expectLink('[data-cy="change-record-correction-reason-link"]').toLinkTo(expectedHref, 'Change reason for record correction');
  });

  it('should render the "provide more information" text without line breaks', () => {
    // Arrange
    const additionalInfo = 'The record needs changing because of the provided reason. Please correct as per the reason.';
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      additionalInfo,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Provide more information')).toRead(additionalInfo);
  });

  it('should render the "provide more information" text with line breaks', () => {
    // Arrange
    const additionalInfo = 'First line\n\nAnother line after some spacing';
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      additionalInfo,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    const expectedContent = 'First line<br><br>Another line after some spacing';
    wrapper.expectElement(definitionDescriptionSelector('Provide more information')).toHaveHtmlContent(expectedContent);
  });

  it('should render the "provide more information" change link', () => {
    // Arrange
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      reportId,
      feeRecordId,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    const expectedHref = `/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}`;
    wrapper.expectLink('[data-cy="change-record-correction-additional-info-link"]').toLinkTo(expectedHref, 'Change more information for record correction');
  });

  it('should render the contact email addresses with line breaks', () => {
    // Arrange
    const emails = ['one@ukexportfinance.gov.uk', 'two@ukexportfinance.gov.uk'];
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      contactEmailAddresses: emails,
    };

    const emailsSelector = definitionDescriptionSelector('Contact email address(es)');
    const expectedContent = 'one@ukexportfinance.gov.uk,<br>two@ukexportfinance.gov.uk';

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement(emailsSelector).toHaveHtmlContent(expectedContent);
    wrapper.expectElement(emailsSelector).hasClass('ukef-word-break-break-all');
  });

  it('should render send request button', () => {
    // Act
    const wrapper = render(aRecordCorrectionRequestInformationViewModel());

    // Assert
    wrapper.expectElement('[data-cy="continue-button"]').toExist();
    wrapper.expectText('[data-cy="continue-button"]').toRead('Send record correction request');
  });

  it('should render cancel button', () => {
    // Arrange
    const cancelLink = '/utilisation-reports/123/create-record-correction-request/456/cancel';
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      cancelLinkHref: cancelLink,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    const cancelLinkSelector = '[data-cy="cancel-link"]';
    wrapper.expectElement(cancelLinkSelector).toExist();
    wrapper.expectLink(cancelLinkSelector).toLinkTo(cancelLink, 'Cancel record correction request');
  });

  it('should render the back link', () => {
    // Arrange
    const viewModel: RecordCorrectionRequestInformationViewModel = {
      ...aRecordCorrectionRequestInformationViewModel(),
      reportId,
      feeRecordId,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    const expectedHref = `/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}`;
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(expectedHref, 'Back');
  });
});
