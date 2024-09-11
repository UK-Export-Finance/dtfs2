import { pageRenderer } from '../pageRenderer';
import { MOCK_TFM_SESSION_USER } from '../../server/test-mocks/mock-tfm-session-user';
import { PRIMARY_NAVIGATION_KEYS } from '../../server/constants';
import {
  BankReportingYearsDataListViewModel,
  FindUtilisationReportsByYearBankViewModel,
  FindUtilisationReportsByYearViewModel,
} from '../../server/types/view-models';

const page = '../templates/utilisation-reports/find-utilisation-reports-by-year.njk';
const render = pageRenderer<FindUtilisationReportsByYearViewModel>(page);

const bankItems: FindUtilisationReportsByYearBankViewModel[] = [
  { value: '961', text: 'Barclays', attributes: {} },
  { value: '123', text: 'HSBC', attributes: {} },
  { value: '24', text: 'Newable', attributes: {} },
];

describe(page, () => {
  const getWrapper = ({ bankError, bankReportingYearsDataLists, yearError, errorSummary }: Partial<FindUtilisationReportsByYearViewModel> = {}) =>
    render({
      user: MOCK_TFM_SESSION_USER,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bankItems,
      bankReportingYearsDataLists: bankReportingYearsDataLists ?? [],
      errorSummary: errorSummary ?? [],
      bankError,
      yearError,
    });

  const getDatalistSelectorForBankId = (bankId: string) => `datalist#datalist--bankId-${bankId}`;

  it('should render the main heading', () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectText('h1[data-cy="find-reports-by-year-heading"]').toRead('Find reports by year');
  });

  it("should render the GET form with id 'find-utilisation-reports-by-year--form'", () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement('form[method="GET"]').toHaveAttribute('id', 'find-utilisation-reports-by-year--form');
  });

  it("should render the year input with id 'find-utilisation-reports-by-year--year-input' with unset 'list' attribute", () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement('input[data-cy="year-input"]').toHaveAttribute('id', 'find-utilisation-reports-by-year--year-input');
    wrapper.expectElement('input[data-cy="year-input"]').toHaveAttribute('list', '');
  });

  it("should render a data list for each of the supplied bank reporting years data lists where there are reporting years with id 'datalist--bankId-<bankId>'", () => {
    // Arrange
    const bankReportingYearsDataLists: BankReportingYearsDataListViewModel[] = [
      { bankId: '123', reportingYears: [2020, 2023] },
      { bankId: '456', reportingYears: [2020, 2021, 2022, 2023] },
      { bankId: '789', reportingYears: [] }, // no reporting years therefore should not render
    ];
    const wrapper = getWrapper({ bankReportingYearsDataLists });

    // Assert
    wrapper.expectElement(getDatalistSelectorForBankId('123')).toExist();
    wrapper.expectElement(getDatalistSelectorForBankId('456')).toExist();
    wrapper.expectElement(getDatalistSelectorForBankId('789')).notToExist();
  });

  it('should render a data list option for each of the bank reporting years with value equal to the year', () => {
    // Arrange
    const bankReportingYearsDataLists: BankReportingYearsDataListViewModel[] = [{ bankId: '123', reportingYears: [2020, 2021, 2022, 2023] }];
    const wrapper = getWrapper({ bankReportingYearsDataLists });

    // Assert
    wrapper.expectElement(`${getDatalistSelectorForBankId('123')}`).toExist();
    wrapper.expectElement(`${getDatalistSelectorForBankId('123')} option`).toHaveCount(4);
    wrapper.expectElement(`${getDatalistSelectorForBankId('123')} option[value="2020"]`).toExist();
    wrapper.expectElement(`${getDatalistSelectorForBankId('123')} option[value="2021"]`).toExist();
    wrapper.expectElement(`${getDatalistSelectorForBankId('123')} option[value="2022"]`).toExist();
    wrapper.expectElement(`${getDatalistSelectorForBankId('123')} option[value="2023"]`).toExist();
  });

  it(`should render a radio button for each bank`, () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    bankItems.forEach((bankItem) => {
      const radioSelector = `input[type="radio"][value="${bankItem.value}"]`;
      wrapper.expectElement(radioSelector).toExist();
      wrapper.expectText(`${radioSelector} ~ label`).toRead(bankItem.text);
    });
  });

  it('should render the year label', () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectText('label[data-cy="year-label"]').toRead('Year');
  });

  it('should render the continue button', () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement('[data-cy="continue-button"]').toExist();
    wrapper.expectText('[data-cy="continue-button"]').toRead('Continue');
  });

  it('should render bank error when present', () => {
    // Arrange
    const wrapper = getWrapper({ bankError: 'Select a bank' });

    // Assert
    wrapper.expectText('main').toContain('Select a bank');
  });

  it('should render year error when present', () => {
    // Arrange
    const wrapper = getWrapper({ yearError: 'Enter a valid year' });

    // Assert
    wrapper.expectText('main').toContain('Enter a valid year');
  });

  it('should render error summary when present', () => {
    // Arrange
    const wrapper = getWrapper({
      errorSummary: [
        { text: "You've done something wrong", href: '#id' },
        { text: "You've done another thing wrong", href: '#other' },
      ],
    });

    // Assert
    wrapper.expectElement('a[href="#id"]').toExist();
    wrapper.expectText('a[href="#id"]').toRead("You've done something wrong");
    wrapper.expectElement('a[href="#other"]').toExist();
    wrapper.expectText('a[href="#other"]').toRead("You've done another thing wrong");
  });
});
