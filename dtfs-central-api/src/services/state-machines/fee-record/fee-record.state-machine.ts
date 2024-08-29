import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { InvalidStateMachineTransitionError, NotFoundError } from '../../../errors';
import { FeeRecordRepo } from '../../../repositories/fee-record-repo';
import { FeeRecordEvent } from './event/fee-record.event';
import {
  handleFeeRecordPaymentAddedEvent,
  handleFeeRecordPaymentDeletedEvent,
  handleFeeRecordPaymentEditedEvent,
  handleFeeRecordMarkAsReconciledEvent,
  handleFeeRecordMarkAsReadyToKeyEvent,
  handleFeeRecordGenerateKeyingDataEvent,
  handleFeeRecordRemoveFromPaymentGroupEvent,
  handleFeeRecordOtherFeeRemovedFromPaymentGroupEvent,
  handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent,
} from './event-handlers';

/**
 * The fee record state machine class
 */
export class FeeRecordStateMachine {
  private readonly feeRecord: FeeRecordEntity;

  private constructor(feeRecord: FeeRecordEntity) {
    this.feeRecord = feeRecord;
  }

  /**
   * Creates a fee record state machine for the supplied fee record
   * @param feeRecord - The fee record to create the state machine for
   * @returns A state machine
   */
  public static forFeeRecord(feeRecord: FeeRecordEntity): FeeRecordStateMachine {
    return new FeeRecordStateMachine(feeRecord);
  }

  /**
   * Creates a fee record state machine for the fee record with the supplied id
   * @param id - The fee record id
   * @returns A state machine
   * @throws {NotFoundError} If a fee record with the supplied id cannot be found
   */
  public static async forFeeRecordId(id: number): Promise<FeeRecordStateMachine> {
    const feeRecord = await FeeRecordRepo.findOneBy({ id });
    if (!feeRecord) {
      throw new NotFoundError(`Failed to find a fee record with id ${id}`);
    }
    return new FeeRecordStateMachine(feeRecord);
  }

  /**
   * Handles an invalid transition event
   * @param param - The event
   */
  private handleInvalidTransition = ({ type: eventType }: FeeRecordEvent): never => {
    const entityName = FeeRecordEntity.name;

    throw InvalidStateMachineTransitionError.forEntity({
      eventType,
      entityName,
      state: this.feeRecord.status,
      entityId: this.feeRecord.id,
    });
  };

  /**
   * Handles a state machine event
   * @param event - The event
   * @returns The modified fee record entity
   */
  public async handleEvent(event: FeeRecordEvent): Promise<FeeRecordEntity> {
    switch (this.feeRecord.status) {
      case 'TO_DO':
        switch (event.type) {
          case 'PAYMENT_ADDED':
            return handleFeeRecordPaymentAddedEvent(this.feeRecord, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case 'MATCH':
        switch (event.type) {
          case 'PAYMENT_DELETED':
            return handleFeeRecordPaymentDeletedEvent(this.feeRecord, event.payload);
          case 'PAYMENT_EDITED':
            return handleFeeRecordPaymentEditedEvent(this.feeRecord, event.payload);
          case 'GENERATE_KEYING_DATA':
            return handleFeeRecordGenerateKeyingDataEvent(this.feeRecord, event.payload);
          case 'REMOVE_FROM_PAYMENT_GROUP':
            return handleFeeRecordRemoveFromPaymentGroupEvent(this.feeRecord, event.payload);
          case 'OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP':
            return handleFeeRecordOtherFeeRemovedFromPaymentGroupEvent(this.feeRecord, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case 'DOES_NOT_MATCH':
        switch (event.type) {
          case 'PAYMENT_ADDED':
            return handleFeeRecordPaymentAddedEvent(this.feeRecord, event.payload);
          case 'PAYMENT_DELETED':
            return handleFeeRecordPaymentDeletedEvent(this.feeRecord, event.payload);
          case 'PAYMENT_EDITED':
            return handleFeeRecordPaymentEditedEvent(this.feeRecord, event.payload);
          case 'REMOVE_FROM_PAYMENT_GROUP':
            return handleFeeRecordRemoveFromPaymentGroupEvent(this.feeRecord, event.payload);
          case 'OTHER_FEE_REMOVED_FROM_PAYMENT_GROUP':
            return handleFeeRecordOtherFeeRemovedFromPaymentGroupEvent(this.feeRecord, event.payload);
          case 'OTHER_FEE_ADDED_TO_PAYMENT_GROUP':
            return handleFeeRecordOtherFeeRecordAddedToPaymentGroupEvent(this.feeRecord, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case 'READY_TO_KEY':
        switch (event.type) {
          case 'MARK_AS_RECONCILED':
            return handleFeeRecordMarkAsReconciledEvent(this.feeRecord, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      case 'RECONCILED':
        switch (event.type) {
          case 'MARK_AS_READY_TO_KEY':
            return handleFeeRecordMarkAsReadyToKeyEvent(this.feeRecord, event.payload);
          default:
            return this.handleInvalidTransition(event);
        }
      default:
        throw new Error(`Unexpected fee record status: '${this.feeRecord.status}'`);
    }
  }
}
