export const industryClassElement = () => document.getElementById('industry-class');

export const appendSelectOption = (selectElement, option) => {
  const optionElement = document.createElement('option');
  optionElement.value = option.value;
  optionElement.textContent = option.name;
  if (option.code === option.selectedValue) {
    optionElement.selected = true;
  }
  selectElement.appendChild(optionElement);
};

export const getIndustryClassesFromSectorCode = (sectors, sectorCode) => {
  const foundSector = sectors.find((sector) => sector.code === sectorCode);
  return foundSector.classes;
};

export const changeIndustryClasses = (event, sectors, selectedValue) => {
  if (event) {
    const sectorCode = event.target.value;
    const selectElement = industryClassElement();
    const industryClasses = getIndustryClassesFromSectorCode(sectors, sectorCode);

    selectElement.innerHTML = '';

    appendSelectOption(selectElement, { value: '', name: 'Select value' });

    industryClasses.forEach((i) => {
      appendSelectOption(selectElement, {
        value: i.code,
        name: i.name,
        selectedValue,
      });
    });

    selectElement.selectedIndex = '0';
  }
};

/**
 * Event handlers are added where strict CSP is not enforced.
 */

// 1. BSS/EWCS - Industry sector dropdown `onChange` event handler
const industrySectorDropdown = document.querySelector('#industry-sector');

if (industrySectorDropdown) {
  const sectors = industrySectorDropdown.getAttribute('data-industry-sectors');

  industrySectorDropdown.addEventListener('change', (event) => {
    changeIndustryClasses(event, JSON.parse(sectors));
  });
}
