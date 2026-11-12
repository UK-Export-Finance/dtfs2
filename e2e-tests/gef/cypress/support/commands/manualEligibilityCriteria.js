/**
 * Set the application eligibility criteria to manual.
 * Accepts all the EC apart from `21`.
 */
import { automaticCover } from '../../e2e/pages/automatic-cover';

export const manualEligibilityCriteria = () => {
  automaticCover.falseRadioButton(12).click();
  automaticCover.falseRadioButton(13).click();
  automaticCover.falseRadioButton(14).click();
  automaticCover.falseRadioButton(15).click();
  automaticCover.falseRadioButton(16).click();
  automaticCover.falseRadioButton(17).click();
  automaticCover.falseRadioButton(18).click();
  automaticCover.falseRadioButton(19).click();
  automaticCover.falseRadioButton(20).click();
  automaticCover.falseRadioButton(21).click();
};
