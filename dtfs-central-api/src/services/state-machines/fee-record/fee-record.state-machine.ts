import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { InvalidStateMachineTransitionError } from '../../../errors';
import { FeeRecordRepo } from '../../../repositories/fee-record-repo';
import { FeeRecordEvent } from './event/fee-record.event';
import { handleFeeRecordPaymentAddedEvent, handleFeeRecordPaymentDeletedEvent, handleFeeRecordPaymentEditedEvent } from './event-handlers';

export class FeeRecordStateMachine {
  private readonly feeRecord: FeeRecordEntity;

  private constructor(feeRecord: FeeRecordEntity) {
    this.feeRecord = feeRecord;
  }

  public static forFeeRecord(feeRecord: FeeRecordEntity): FeeRecordStateMachine {
    return new FeeRecordStateMachine(feeRecord);
  }

  public static async forFeeRecordId(id: number): Promise<FeeRecordStateMachine> {
    const feeRecord = await FeeRecordRepo.findOneByOrFail({ id });
    return new FeeRecordStateMachine(feeRecord);
  }

  private handleInvalidTransition = ({ type: eventType }: FeeRecordEvent): never => {
    const entityName = FeeRecordEntity.name;

    throw InvalidStateMachineTransitionError.forEntity({
      eventType,
      entityName,
      state: this.feeRecord.status,
      entityId: this.feeRecord.id,
    });
  };

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
          default:
            return this.handleInvalidTransition(event);
        }
      case 'READY_TO_KEY':
        switch (event.type) {
          default:
            return this.handleInvalidTransition(event);
        }
      case 'RECONCILED':
        switch (event.type) {
          default:
            return this.handleInvalidTransition(event);
        }
      default:
        throw new Error(`Unexpected fee record status: '${this.feeRecord.status}'`);
    }
  }
}
