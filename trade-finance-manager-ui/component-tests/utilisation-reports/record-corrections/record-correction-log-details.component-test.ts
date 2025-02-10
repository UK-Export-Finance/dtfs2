import { aCreateRecordCorrectionLogDetailsViewModel } from '../../../test-helpers/test-data/view-models';
import { pageRenderer } from '../../pageRenderer';

const page = '../templates/utilisation-reports/record-corrections/record-correction-log-details.njk';
const render = pageRenderer(page);

const definitionDescriptionSelector = (definitionTerm: string) => `[data-cy="summary-list"] dt:contains("${definitionTerm}") + dd`;
const statusTagSelector = '[data-cy="record-correction-status"]';

describe(page, () => {
  const viewModel = aCreateRecordCorrectionLogDetailsViewModel();

  const { correctionDetails } = viewModel;

  it('should render the main heading', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('h1[data-cy="main-heading"]').toRead('Record correction log');
    wrapper.expectText('span[data-cy="heading-caption"]').toRead('test bank, January 2023');
  });

  it('should render a record correction status tag', () => {
    // Act
    const wrapper = render({
      statusCode: viewModel.status,
      displayStatus: viewModel.displayStatus,
    });

    // Assert
    wrapper.expectText(statusTagSelector).toRead(viewModel.displayStatus);
  });

  it('should render the exporter', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Exporter')).toRead(correctionDetails.exporter);
  });

  it('should render the facility id', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Facility ID')).toRead(correctionDetails.facilityId);
  });

  it('should render the date sent', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Date sent')).toRead(correctionDetails.formattedDateSent);
  });

  it('should render the contact name', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Contact name')).toRead(correctionDetails.bankTeamName);
  });

  it('should render the contact email addresses', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Contact email address(es)')).toRead(correctionDetails.formattedBankTeamEmails);
  });

  it('should render the requested by', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Requested by')).toRead(correctionDetails.formattedRequestedByUser);
  });

  it('should render the reasons for correction', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Reason(s) for correction')).toRead(correctionDetails.formattedReasons);
  });

  it('should render the additional information', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Additional information')).toRead(correctionDetails.additionalInfo);
  });

  it('should render the old records', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Old record(s)')).toRead(correctionDetails.formattedOldRecords);
  });

  it('should render the correct records', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('New record')).toRead(correctionDetails.formattedCorrectRecords);
  });

  it('should render the bank commentary', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Bank commentary')).toRead(correctionDetails.formattedBankCommentary);
  });

  it('should render the date correction received', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(definitionDescriptionSelector('Date correction received')).toRead(correctionDetails.formattedDateReceived);
  });

  it('should render the back link', () => {
    // Arrange
    const backLinkHref = 'some-bank-link-href';

    // Act
    const wrapper = render({
      backLinkHref,
    });

    // Assert
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(backLinkHref, 'Back');
  });
});
