import { PaymentEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';

export const PaymentRepo = SqlDbDataSource.getRepository(PaymentEntity).extend({});
