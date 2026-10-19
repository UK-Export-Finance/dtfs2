import { completeFeeRecordCorrectionRequestForm } from './fee-record-correction/completeFeeRecordCorrectionRequestForm';
import { completeAndSubmitFeeRecordCorrectionRequestForm } from './fee-record-correction/completeAndSubmitFeeRecordCorrectionRequestForm';
import { checkRecordCorrectionLogTableRowValues } from './fee-record-correction/checkRecordCorrectionLogTableRowValues';
import { addPaymentToFeeRecords } from './fee-record-correction/addPaymentToFeeRecords';
import { checkRecordCorrectionRowExporterWithoutId } from './fee-record-correction/checkRecordCorrectionRowExporterWithoutId';

Cypress.Commands.add('completeFeeRecordCorrectionRequestForm', completeFeeRecordCorrectionRequestForm);
Cypress.Commands.add('completeAndSubmitFeeRecordCorrectionRequestForm', completeAndSubmitFeeRecordCorrectionRequestForm);
Cypress.Commands.add('checkRecordCorrectionLogTableRowValues', checkRecordCorrectionLogTableRowValues);
Cypress.Commands.add('addPaymentToFeeRecords', addPaymentToFeeRecords);
Cypress.Commands.add('checkRecordCorrectionRowExporterWithoutId', checkRecordCorrectionRowExporterWithoutId);
