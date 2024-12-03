import { format } from 'date-fns';
import { componentRenderer } from '../../../componentRenderer';

const component = '../templates/case/activity/_macros/cancellation-activity-html.njk';

const render = componentRenderer(component, false);

const aCancellationActivity = () => ({
  bankRequestDate: new Date().valueOf(),
  effectiveFrom: new Date().valueOf(),
  reason: 'This is the reason',
});

describe(component, () => {
  it('should render bank request date', () => {
    // Arrange
    const bankRequestDate = new Date();
    const activity = {
      ...aCancellationActivity(),
      bankRequestDate: bankRequestDate.valueOf(),
    };

    // Act
    const wrapper = render(activity);

    // Assert

    wrapper.expectText('[data-cy="bank-request-date"]').toRead(`Bank request date: ${format(bankRequestDate, 'd MMMM yyyy')}`);
  });

  it('should render effective from date', () => {
    // Arrange
    const effectiveFrom = new Date();
    const activity = {
      ...aCancellationActivity(),
      effectiveFrom: effectiveFrom.valueOf(),
    };

    // Act
    const wrapper = render(activity);

    // Assert
    wrapper.expectText('[data-cy="date-effective-from"]').toRead(`Date effective from: ${format(effectiveFrom, 'd MMMM yyyy')}`);
  });

  it('should render reason when it is provided', () => {
    // Arrange
    const reason = 'reason';
    const activity = {
      ...aCancellationActivity(),
      reason,
    };

    // Act
    const wrapper = render(activity);

    // Assert
    wrapper.expectText('[data-cy="cancellation-comments"]').toRead(`Comments: ${reason}`);
  });

  it('should render reason as `-` when it is empty', () => {
    // Arrange
    const activity = {
      ...aCancellationActivity(),
      reason: '',
    };

    // Act
    const wrapper = render(activity);

    // Assert
    wrapper.expectText('[data-cy="cancellation-comments"]').toRead(`Comments: -`);
  });

  it('should render deal stage', () => {
    // Arrange
    const activity = aCancellationActivity();

    // Act
    const wrapper = render(activity);

    // Assert
    wrapper.expectText('[data-cy="deal-stage"]').toContain('Deal stage');
    wrapper.expectText('[data-cy="deal-stage"]').toContain('Cancelled');
    wrapper.expectElement('[data-cy="cancelled-tag"]').hasClass('govuk-tag--red');
  });
});
