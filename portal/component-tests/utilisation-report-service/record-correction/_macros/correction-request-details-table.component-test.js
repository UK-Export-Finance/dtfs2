const componentRenderer = require('../../../componentRenderer');

const component = 'utilisation-report-service/record-correction/_macros/correction-request-details-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  const facilityId = '12345678';
  const exporter = 'An exporter';
  const reportedFees = 'GBP 77';
  const formattedReasons = 'Reason 1, Reason 2';
  const additionalInfo = 'Some additional info';

  let wrapper;
  beforeEach(() => {
    wrapper = render({
      details: {
        facilityId,
        exporter,
        reportedFees,
        formattedReasons,
        additionalInfo,
      },
    });
  });

  it('should render the current record details table', () => {
    wrapper.expectElement('[data-cy="correction-request-details-table"]').toExist();

    wrapper.expectText('[data-cy="correction-request-details-table--facility-id"]').toRead(facilityId);
    wrapper.expectText('[data-cy="correction-request-details-table--exporter"]').toRead(exporter);
    wrapper.expectText('[data-cy="correction-request-details-table--reported-fees"]').toRead(reportedFees);
    wrapper.expectText('[data-cy="correction-request-details-table--formatted-reasons"]').toRead(formattedReasons);
    wrapper.expectText('[data-cy="correction-request-details-table--additional-info"]').toRead(additionalInfo);
  });
});
