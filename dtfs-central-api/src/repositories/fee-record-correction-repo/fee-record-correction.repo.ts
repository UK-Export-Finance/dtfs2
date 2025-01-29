import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordCorrectionEntity } from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';

/**
 * Repository for managing fee record corrections.
 */
export const FeeRecordCorrectionRepo = SqlDbDataSource.getRepository(FeeRecordCorrectionEntity).extend({
  /**
   * Finds one fee record correction with the supplied id with the fee record
   * attached
   * @param id - The fee record correction id
   * @returns The found fee record correction, else null
   */
  async findOneByIdWithFeeRecord(id: number): Promise<FeeRecordCorrectionEntity | null> {
    return await this.findOne({
      where: {
        id,
      },
      relations: { feeRecord: true },
    });
  },

  /**
   * Finds one fee record correction with the supplied id with the fee record
   * and report attached
   * @param id - The fee record correction id
   * @returns The found fee record correction, else null
   */
  async findOneByIdWithFeeRecordAndReport(id: number): Promise<FeeRecordCorrectionEntity | null> {
    return await this.findOne({
      where: {
        id,
      },
      relations: { feeRecord: { report: true } },
    });
  },

  /**
   * Finds one fee record correction with correction id and bank id with
   * the fee record and report attached
   * @param id - The fee record correction id
   * @returns The found fee record correction, else null
   */
  async findOneByIdAndBankIdWithFeeRecordAndReport(correctionId: number, bankId: string): Promise<FeeRecordCorrectionEntity | null> {
    return await this.findOne({
      where: {
        id: correctionId,
        feeRecord: { report: { bankId } },
      },
      relations: { feeRecord: { report: true } },
    });
  },

  /**
   * Finds one fee record correction with the given id and bank id.
   * @param correctionId - The id of the correction.
   * @param bankId - The id of the bank.
   * @returns The found fee record correction, else null.
   */
  async findByIdAndBankId(correctionId: number, bankId: string): Promise<FeeRecordCorrectionEntity | null> {
    return await this.findOneBy({ id: correctionId, feeRecord: { report: { bankId } } });
  },

  /**
   * Finds completed fee record corrections with the given bank id, with
   * each of their fee records attached.
   * @param bankId - The id of the bank.
   * @returns The found fee record corrections with each of their fee records attached.
   */
  async findCompletedCorrectionsByBankIdWithFeeRecord(bankId: string): Promise<FeeRecordCorrectionEntity[]> {
    return await this.find({ where: { isCompleted: true, feeRecord: { report: { bankId } } }, relations: { feeRecord: true } });
  },

  withTransaction(transactionEntityManager: EntityManager) {
    const transactionRepository = transactionEntityManager.getRepository(FeeRecordCorrectionEntity);

    return {
      findOneByIdWithFeeRecord: this.findOneByIdWithFeeRecord.bind(transactionRepository),
      findOneByIdWithFeeRecordAndReport: this.findOneByIdWithFeeRecordAndReport.bind(transactionRepository),
      findOneByIdAndBankIdWithFeeRecordAndReport: this.findOneByIdAndBankIdWithFeeRecordAndReport.bind(transactionRepository),
      findByIdAndBankId: this.findByIdAndBankId.bind(transactionRepository),
    };
  },
});
