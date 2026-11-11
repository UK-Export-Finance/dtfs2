import { clickBackLink } from './click-back-link';
import { clickCancelButton } from './click-cancel-button';
import { clickCancelLink } from './click-cancel-link';
import { clickContinueButton } from './click-continue-button';
import { clickSaveAndReturnButton } from './click-save-and-return-button';
import { clickSubmitButton } from './click-submit-button';

Cypress.Commands.add('clickBackLink', clickBackLink);
Cypress.Commands.add('clickCancelButton', clickCancelButton);
Cypress.Commands.add('clickCancelLink', clickCancelLink);
Cypress.Commands.add('clickContinueButton', clickContinueButton);
Cypress.Commands.add('clickSaveAndReturnButton', clickSaveAndReturnButton);
Cypress.Commands.add('clickSubmitButton', clickSubmitButton);
