/**
 * @jest-environment jsdom
 */

describe('correspondence-address.js', () => {
  const classNameToHideElement = 'govuk-visually-hidden';

  const conditionalCorrespondenceHtml = '<div id="conditional-correspondence"></div>';
  const conditionalCorrespondenceElement = () => document.getElementById('conditional-correspondence');

  const yesCorrespondenceRadioHtml = ({ isChecked }) => `<input type="radio" id="correspondence" data-cy="correspondence-yes" ${isChecked ? 'checked' : ''}>`;
  const noCorrespondenceRadioHtml = ({ isChecked }) => `<input type="radio" id="correspondence-2" data-cy="correspondence-no" ${isChecked ? 'checked' : ''}>`;

  const divContaining = (...htmlItems) => `<div>${htmlItems.join('')}</div>`;

  // eslint-disable-next-line global-require
  const runCorrespondenceAddressScript = () => jest.isolateModules(() => require('./correspondence-address'));

  it('does not set a class to hide the conditional correspondence element on load if the yes correspondence radio is checked', () => {
    document.body.innerHTML = divContaining(
      yesCorrespondenceRadioHtml({ isChecked: true }),
      noCorrespondenceRadioHtml({ isChecked: false }),
      conditionalCorrespondenceHtml,
    );

    runCorrespondenceAddressScript();

    expect(conditionalCorrespondenceElement().className).toEqual('');
  });

  it('sets a class to hide the conditional correspondence element on load if the no correspondence radio is checked', () => {
    document.body.innerHTML = divContaining(
      yesCorrespondenceRadioHtml({ isChecked: false }),
      noCorrespondenceRadioHtml({ isChecked: true }),
      conditionalCorrespondenceHtml,
    );

    runCorrespondenceAddressScript();

    expect(conditionalCorrespondenceElement().className).toEqual(classNameToHideElement);
  });

  it('sets a class to hide the conditional correspondence element on load if neither of the correspondence radios are checked', () => {
    document.body.innerHTML = divContaining(
      yesCorrespondenceRadioHtml({ isChecked: false }),
      noCorrespondenceRadioHtml({ isChecked: false }),
      conditionalCorrespondenceHtml,
    );

    runCorrespondenceAddressScript();

    expect(conditionalCorrespondenceElement().className).toEqual(classNameToHideElement);
  });
});
