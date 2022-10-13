/**
 * @jest-environment jsdom
 */

import {
  industryClassElement,
  appendSelectOption,
  getIndustryClassesFromSectorCode,
  changeIndustryClasses,
} from './change-industry-classes';

describe('changeIndustryClasses', () => {
  const mockSectors = [
    {
      code: '100',
      classes: [
        { code: '12', name: 'Hotels and similar accommodation' },
        { code: '34', name: 'Holiday centres and villages' },
      ],
    },
    {
      code: '200',
      classes: [
        { code: '12', name: 'Renting and leasing of cars and light motor vehicles' },
        { code: '34', name: 'Renting and leasing of trucks and other heavy vehicles' },
      ],
    },
  ];

  beforeEach(() => {
    document.body.innerHTML = '<select id="industry-class">'
      + '  <option value="1">test</option>'
      + '</select>';
  });

  describe('appendSelectOption', () => {
    it('should append a given option to #industryClass select element', () => {
      const mockOption = { value: '2', name: 'test' };
      const element = industryClassElement();

      appendSelectOption(element, mockOption);

      const selectOptions = Array.from(element.options);

      expect(selectOptions.length).toEqual(2);
      expect(selectOptions[selectOptions.length - 1].value).toEqual(mockOption.value);
      expect(selectOptions[selectOptions.length - 1].text).toEqual(mockOption.name);
    });
  });

  describe('getIndustryClassesFromSectorCode', () => {
    it('should return an industries classes from a given industry sector code', () => {
      const mockSectorCode = '200';
      const result = getIndustryClassesFromSectorCode(mockSectors, mockSectorCode);

      const expected = mockSectors.find((sector) => sector.code === mockSectorCode).classes;
      expect(result).toEqual(expected);
    });
  });

  describe('changeIndustryClasses', () => {
    it('should render correct array of `industry sector classes` as select options', () => {
      const sectorCode = '200';
      const mockEvent = {
        target: {
          value: sectorCode,
        },
      };

      changeIndustryClasses(mockEvent, mockSectors);

      const element = industryClassElement();
      const selectOptions = Array.from(element.options);

      // plus one for the empty first select option
      const expectedOptionsLength = getIndustryClassesFromSectorCode(mockSectors, mockEvent.target.value).length + 1;
      expect(selectOptions.length).toEqual(expectedOptionsLength);
    });
  });
});
