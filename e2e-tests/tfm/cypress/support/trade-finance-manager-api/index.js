Cypress.Commands.add('submitDeal', require('./submitDeal'));
Cypress.Commands.add('submitManyDeals', require('./submitManyDeals'));
Cypress.Commands.add('getUser', require('./getUser'));

Cypress.Commands.add('insertManyTfmDealsIntoDb', require('./insertManyTfmDealsIntoDb'));
Cypress.Commands.add('deleteAllTfmDealsFromDb', require('./deleteAllTfmDealsFromDb'));
Cypress.Commands.add('insertManyTfmFacilitiesAndTwoLinkedDealsIntoDb', require('./insertManyTfmFacilitiesAndTwoLinkedDealsIntoDb'));
Cypress.Commands.add('deleteAllTfmFacilitiesFromDb', require('./deleteAllTfmFacilitiesFromDb'));
