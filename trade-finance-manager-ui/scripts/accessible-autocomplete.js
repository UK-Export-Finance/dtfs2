import accessibleAutocomplete from 'accessible-autocomplete';

const init = () => {
  window.accessibleAutocomplete = accessibleAutocomplete;

  const exporterCreditRatingOther = document.getElementById('exporterCreditRatingOther');

  accessibleAutocomplete.enhanceSelectElement({
    selectElement: exporterCreditRatingOther,
    defaultValue: '',
  });

  return accessibleAutocomplete;
};

export default init();
