import attachToWindow, {
  getElement,
  showHideElement,
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

  describe('showHideElement', () => {
    describe('when the given boolean is true', () => {
      it('should change the element\'s className to be empty', () => {
        showHideElement(elementId, true);

        const elementClassName = getElement(elementId).className;
        expect(elementClassName).toEqual('');
      });
    });

    describe('when the given boolean is false', () => {
      it('should change the element\'s className to be `govuk-visually-hidden`', () => {
        showHideElement(elementId, true);
        showHideElement(elementId, false);

        const elementClassName = getElement(elementId).className;
        expect(elementClassName).toEqual('govuk-visually-hidden');
      });
    });
  });

  describe('attachToWindow', () => {
    it('should attach showHideElement function to window.dtfs', () => {
      attachToWindow();
      expect(global.window.dtfs.showHideElement).toEqual(showHideElement);
    });
  });
});
