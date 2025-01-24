import { aRecordCorrectionSentViewModel } from '../../../test-helpers/test-data/view-models';
import pageRenderer from '../../pageRenderer';

const page = 'utilisation-report-service/record-correction/correction-sent.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should display main header with report period', () => {
    // Arrange
    const formattedReportPeriod = 'January to March 2023';

    // Act
    const wrapper = render({
      ...aRecordCorrectionSentViewModel(),
      formattedReportPeriod,
    });

    // Assert
    const expected = `${formattedReportPeriod} record correction sent to UKEF`;
    wrapper.expectText('[data-cy="main-heading"]').toRead(expected);
  });

  it('should display sent to emails', () => {
    // Arrange
    const sentToEmails = ['email1@ukexportfinance.gov.uk', 'email2@ukexportfinance.gov.uk'];

    // Act
    const wrapper = render({
      ...aRecordCorrectionSentViewModel(),
      sentToEmails,
    });

    // Assert
    wrapper.expectText('[data-cy="email-list"]').toContain(sentToEmails[0]);
    wrapper.expectText('[data-cy="email-list"]').toContain(sentToEmails[1]);
  });

  it('should display continue button which links back to the utilisation report upload page', () => {
    // Act
    const wrapper = render(aRecordCorrectionSentViewModel());

    // Assert
    const expectedHref = '/utilisation-report-upload';
    wrapper.expectPrimaryButton('[data-cy="continue-button"]').toLinkTo(expectedHref, 'Continue');
  });
});
