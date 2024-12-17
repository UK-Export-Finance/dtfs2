import { aRecordCorrectionRequestSentViewModel } from '../../../test-helpers/test-data/view-models/record-corrections';
import { RecordCorrectionRequestSentViewModel } from '../../../server/types/view-models';
import { pageRenderer } from '../../pageRenderer';

const page = '../templates/utilisation-reports/record-corrections/request-sent.njk';
const render = pageRenderer<RecordCorrectionRequestSentViewModel>(page);

describe('page', () => {
  it('should render the page heading', () => {
    // Arrange
    const viewModel: RecordCorrectionRequestSentViewModel = {
      ...aRecordCorrectionRequestSentViewModel(),
      bank: { name: 'Test bank' },
      formattedReportPeriod: 'January 2030',
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('h1[data-cy="main-heading"]').toRead('Record correction request');
    wrapper.expectText('span[data-cy="heading-caption"]').toRead('Test bank, January 2030');
  });

  it('should render the success panel', () => {
    // Arrange
    const viewModel = aRecordCorrectionRequestSentViewModel();

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement('[data-cy="request-sent-panel"]').toExist();
    wrapper.expectText('[data-cy="request-sent-panel"] h1').toRead('Request sent');
    wrapper.expectText('[data-cy="request-sent-panel"] [class="govuk-panel__body"]').toRead('Your record correction request has been sent');
  });

  it('should render the contact email addresses', () => {
    // Arrange
    const emails = ['test1@ukexportfinance.gov.uk', 'test2@ukexportfinance.gov.uk'];
    const viewModel: RecordCorrectionRequestSentViewModel = {
      ...aRecordCorrectionRequestSentViewModel(),
      emailsWithoutRequestedByUserEmail: emails,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('[data-cy="other-email-address-1"]').toRead(emails[0]);
    wrapper.expectText('[data-cy="other-email-address-2"]').toRead(emails[1]);
  });

  it('should render the requesting users email address', () => {
    // Arrange
    const email = 'user@ukexportfinance.gov.uk';
    const viewModel: RecordCorrectionRequestSentViewModel = {
      ...aRecordCorrectionRequestSentViewModel(),
      requestedByUserEmail: email,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('p[data-cy="user-email-address-copy"]').toRead(`A copy of the email has also been sent to ${email}.`);
  });

  it('should render "back to premium payments" button', () => {
    // Arrange
    const reportId = '7';
    const viewModel: RecordCorrectionRequestSentViewModel = {
      ...aRecordCorrectionRequestSentViewModel(),
      reportId,
    };
    const expectedLink = `/utilisation-reports/${reportId}`;

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectSecondaryButton('[data-cy="back-to-premium-payments-button"]').toLinkTo(expectedLink, 'Back to premium payments');
  });
});
