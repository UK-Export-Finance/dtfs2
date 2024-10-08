const { pageRenderer } = require('../pageRenderer');

const page = '../templates/utilisation-reports/check-keying-data.njk';

const render = pageRenderer(page);

describe(page, () => {
  const VIEW_MODEL = {
    reportId: '1',
    bank: { id: '123', name: 'Test bank' },
    formattedReportPeriod: 'January 2024',
    feeRecords: [],
    numberOfMatchingFacilities: 1,
  };

  const getWrapper = () => render(VIEW_MODEL);

  it('renders the back link to the utilisation reports url', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    wrapper.expectLink('a:contains("Back")').toLinkTo('/utilisation-reports/1', 'Back');
  });

  it('renders the heading with the caption above it', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    wrapper.expectText('h1 span').toMatch(/Test bank, January 2024/);
    wrapper.expectText('h1').toMatch(/Check before generating keying sheet data/);
  });

  it('renders the number of matched facilities text using the singular form when there is one matched payment', () => {
    // Arrange
    const viewModel = {
      ...VIEW_MODEL,
      numberOfMatchingFacilities: 1,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('h1').toMatch(/1 matched facility/);
  });

  it('renders the number of matched facilities text using the plural form when there is more than one matched payment', () => {
    // Arrange
    const viewModel = {
      ...VIEW_MODEL,
      numberOfMatchingFacilities: 3,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('h1').toMatch(/3 matched facilities/);
  });

  it('renders the table with the table headings', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    const tableSelector = 'table[data-cy="check-keying-data-table"]';
    wrapper.expectElement(tableSelector).toExist();
    wrapper.expectText(`${tableSelector} thead th`).toMatch(/Facility ID/);
    wrapper.expectText(`${tableSelector} thead th`).toMatch(/Exporter/);
    wrapper.expectText(`${tableSelector} thead th`).toMatch(/Reported fees/);
    wrapper.expectText(`${tableSelector} thead th`).toMatch(/Reported payments/);
    wrapper.expectText(`${tableSelector} thead th`).toMatch(/Payments received/);
    wrapper.expectText(`${tableSelector} thead th`).toMatch(/Status/);
  });

  it('renders the numeric table headings with the numeric class', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    const govukNumericHeaderClassName = 'govuk-table__header--numeric';
    const headerSelector = (headerText) => `table[data-cy="check-keying-data-table"] thead th:contains(${headerText})`;
    wrapper.expectElement(headerSelector('Reported fees')).hasClass(govukNumericHeaderClassName);
    wrapper.expectElement(headerSelector('Reported payments')).hasClass(govukNumericHeaderClassName);
    wrapper.expectElement(headerSelector('Payments received')).hasClass(govukNumericHeaderClassName);
  });

  it('renders the generate keying sheet data button which posts to the generate keying data url', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    const formSelector = 'form[method="post"]';
    wrapper.expectElement(formSelector).toExist();
    wrapper.expectInput(`${formSelector} input.govuk-button`).toHaveValue('Generate keying sheet data');
    wrapper.expectElement(`${formSelector} input.govuk-button`).toHaveAttribute('formaction', '/utilisation-reports/1/keying-data');
  });

  it('renders the cancel link which links to the premium payments table', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    wrapper.expectLink('form[method="post"] a').toLinkTo(`/utilisation-reports/1`, 'Cancel');
  });
});
