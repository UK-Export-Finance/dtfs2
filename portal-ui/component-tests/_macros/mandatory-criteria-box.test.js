const componentRenderer = require('../componentRenderer');

const component = '_macros/mandatory-criteria-box.njk';
const render = componentRenderer(component);
const deal = require('../fixtures/deal-fully-completed');

const { mandatoryCriteria } = deal;

describe(component, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render({ mandatoryCriteria });
  });

  it('should render all the headings', () => {
    wrapper.expectElement('[data-cy="mandatory-criteria-box"]').toExist();
    wrapper.expectText('h4').toRead('Mandatory criteria');
    wrapper.expectText('h5').toRead('This deal meets all UKEF’s mandatory criteria.');
  });

  it('should render introductory paragraph', () => {
    wrapper
      .expectText('p')
      .toRead('You have affirmed that all the following mandatory criteria are or will be true for this deal on the date that cover starts.');
  });

  it('should render criteria as HTML', () => {
    // Arrange
    wrapper = render({ mandatoryCriteria });

    // Assert
    wrapper
      .expectElement('li[value=4]')
      .toHaveHtmlContent(
        'Where the supplier is not a “Person Within Scope of Windsor Framework”, it is an [eligible person](/assets/files/financial_difficulty_model_1.1.0.xlsx) OR',
      );

    wrapper
      .expectElement('li[value=5]')
      .toHaveHtmlContent(
        'Where the supplier is a “Person Within Scope of Windsor Framework”, both it and its parent obligor (if any) is an [eligible person](/assets/files/financial_difficulty_model_1.1.0.xlsx).',
      );
  });

  it('should render criteria as HTML with explicity parameter as false', () => {
    // Arrange
    wrapper = render({ mandatoryCriteria, text: false });

    // Assert
    wrapper
      .expectElement('li[value=4]')
      .toHaveHtmlContent(
        'Where the supplier is not a “Person Within Scope of Windsor Framework”, it is an [eligible person](/assets/files/financial_difficulty_model_1.1.0.xlsx) OR',
      );

    wrapper
      .expectElement('li[value=5]')
      .toHaveHtmlContent(
        'Where the supplier is a “Person Within Scope of Windsor Framework”, both it and its parent obligor (if any) is an [eligible person](/assets/files/financial_difficulty_model_1.1.0.xlsx).',
      );
  });

  it('should render criteria as plain text', () => {
    // Arrange
    wrapper = render({ mandatoryCriteria, text: true });

    // Assert
    wrapper.expectElement('li[value=4]').toContain('Where the supplier is not a “Person Within Scope of Windsor Framework”, it is an eligible person OR');

    wrapper
      .expectElement('li[value=5]')
      .toContain('Where the supplier is a “Person Within Scope of Windsor Framework”, both it and its parent obligor (if any) is an eligible person.');
  });

  it('should not render mandatory criteria macro if no criterion exist', () => {
    // Arrange
    wrapper = render({});

    // Assert
    wrapper.expectElement('[data-cy="mandatory-criteria-box"]').notToExist();
  });

  it('should not render mandatory criteria macro if no criterion exist', () => {
    // Arrange
    wrapper = render({
      mandatoryCriteria: [],
    });

    // Assert
    wrapper.expectElement('[data-cy="mandatory-criteria-box"]').notToExist();
  });
});
