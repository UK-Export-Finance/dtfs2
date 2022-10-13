/**
 * @jest-environment jsdom
 */
import {
  getElement,
  showHideElement,
  changeScreenVisibilityOfElement,
} from './show-hide-element';

describe('changeIndustryClasses', () => {
  const elementId = 'mock-element';

  beforeEach(() => {
    document.body.innerHTML = `<div id="${elementId}" class="govuk-visually-hidden">`
      + '  <p>test</p>'
      + '</div>';
  });

  describe('getElement', () => {
    it('should get an element from the given ID', () => {
      const expected = document.getElementById(elementId);
      expect(getElement(elementId)).toEqual(expected);
    });
  });

  describe('changeScreenVisibilityOfElement', () => {
    describe('when the given boolean is true', () => {
      it('should change the element\'s className to be empty', () => {
        changeScreenVisibilityOfElement(elementId, true);

        const elementClassName = getElement(elementId).className;
        expect(elementClassName).toEqual('');
      });
    });

    describe('when the given boolean is false', () => {
      it('should change the element\'s className to be `display-none`', () => {
        changeScreenVisibilityOfElement(elementId, true);
        changeScreenVisibilityOfElement(elementId, false);

        const elementClassName = getElement(elementId).className;
        expect(elementClassName).toEqual('display-none');
      });
    });
  });

  describe('showHideElement', () => {
    describe('when the given boolean is true', () => {
      it('should add the hidden attribute to element', () => {
        showHideElement(elementId, true);

        const elementHidden = getElement(elementId).getAttribute('hidden');
        expect(elementHidden).toBeNull();
      });
    });

    describe('when the given boolean is false', () => {
      it('should should add hidden attribute to element`', () => {
        showHideElement(elementId, true);
        showHideElement(elementId, false);

        const elementHidden = getElement(elementId).getAttribute('hidden');
        expect(elementHidden).toEqual('true');
      });
    });
  });
});
