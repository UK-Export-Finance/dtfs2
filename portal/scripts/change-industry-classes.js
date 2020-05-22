export const industryClassElement = () => document.getElementById('industry-class');

export const appendSelectOption = (selectElement, option) => {
  const optionElement = document.createElement('option');
  optionElement.value = option.value;
  optionElement.innerHTML = option.name;
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

    appendSelectOption(
      selectElement,
      { value: '', name: 'Select value' },
    );

    industryClasses.forEach((i) => {
      appendSelectOption(
        selectElement,
        {
          value: i.code,
          name: i.name,
          selectedValue,
        },
      );
    });

    selectElement.selectedIndex = '0';
  }
};

const attachToWindow = () => {
  window.dtfs = {
    ...window.dtfs,
    changeIndustryClasses,
  };
};

export default attachToWindow;
