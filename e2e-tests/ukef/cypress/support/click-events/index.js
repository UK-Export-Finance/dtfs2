import { clickSubmitButton } from './click-submit-button';
import { clickContinueButton } from './click-continue-button';
import { clickBackLink } from './click-back-link';
import { clickCancelLink } from './click-cancel-link';
import { clickReturnToMakerButton } from './click-return-to-maker-button';

Cypress.Commands.add('clickSubmitButton', clickSubmitButton);
Cypress.Commands.add('clickContinueButton', clickContinueButton);
Cypress.Commands.add('clickBackLink', clickBackLink);
Cypress.Commands.add('clickCancelLink', clickCancelLink);
Cypress.Commands.add('clickReturnToMakerButton', clickReturnToMakerButton);
