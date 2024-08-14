const setupFindUtilisationReportsByYearYearInput = (): void => {
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

setupFindUtilisationReportsByYearYearInput();
