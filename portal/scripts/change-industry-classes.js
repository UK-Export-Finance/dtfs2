export const industryClassElement = () => document.getElementById('industryClass');

export const appendSelectOption = (selectElement, option) => {
  const optionElement = document.createElement('option');
  optionElement.value = option.value;
  optionElement.innerHTML = option.name;
  selectElement.appendChild(optionElement);
};

export const getIndustryClassesFromSectorCode = (sectors, sectorCode) => {
  const foundSector = sectors.find((sector) => sector.code === sectorCode);
  return foundSector.classes;
};

export const changeIndustryClasses = (event, sectors) => {
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
        },
      );
    });
  }
};

const attachToWindow = () => {
  window.dtfs = {
    ...window.dtfs,
    changeIndustryClasses,
  };
};

export default attachToWindow;
