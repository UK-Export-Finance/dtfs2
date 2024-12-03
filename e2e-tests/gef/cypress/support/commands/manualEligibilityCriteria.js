/**
 * Set the application eligibility criteria to manual.
 * Accepts all the EC apart from `21`.
 */
import eligibility from '../../e2e/pages/automatic-cover';

const manualEligibilityCriteria = () => {
  eligibility.falseRadioButton(12).click();
  eligibility.falseRadioButton(13).click();
  eligibility.falseRadioButton(14).click();
  eligibility.falseRadioButton(15).click();
  eligibility.falseRadioButton(16).click();
  eligibility.falseRadioButton(17).click();
  eligibility.falseRadioButton(18).click();
  eligibility.falseRadioButton(19).click();
  eligibility.falseRadioButton(20).click();
  eligibility.falseRadioButton(21).click();
};

export default manualEligibilityCriteria;
