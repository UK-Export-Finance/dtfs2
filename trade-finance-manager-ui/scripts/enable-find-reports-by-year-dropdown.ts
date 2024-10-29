/**
 * Enables the dynamic dropdown for the find utilisation reports
 * by year page
 *
 * This dropdown is attached to the year input on the page. When
 * a bank is selected from the list of radios, we want to update
 * the datalist attached to the input element so that it lines
 * up with the selected bank. This is done by adding an event
 * listener to the bank radio which sets the input "list"
 * attribute to the corresponding datalist id, causing the
 * dropdown displayed beneath the input to display the years
 * where the selected bank has an uploaded report.
 */
const enableFindReportsByYearDropdown = (): void => {
  const findUtilisationReportsByYearForm: HTMLFormElement | null = document.querySelector('form#find-utilisation-reports-by-year--form');

  if (!findUtilisationReportsByYearForm) {
    return;
  }

  const yearInput: HTMLInputElement | null = document.querySelector('input#find-utilisation-reports-by-year--year-input');

  if (!yearInput) {
    return;
  }

  const bankRadios: NodeListOf<HTMLInputElement> = findUtilisationReportsByYearForm.querySelectorAll('input.govuk-radios__input');

  bankRadios.forEach((bankRadio) => {
    const bankId = bankRadio.value;
    const dataListId = `datalist--bankId-${bankId}`;

    if (bankRadio.checked) {
      yearInput.setAttribute('list', dataListId);
    }

    bankRadio.addEventListener('click', () => {
      yearInput.setAttribute('list', dataListId);
    });
  });
};

enableFindReportsByYearDropdown();
