import z from 'zod';
import { AMENDMENT_STATUS } from '../../../../../constants';
import { AmendmentStatus } from '../../../../../types/amendment-status';

export const AmendmentStatusSchema = z.enum(Object.values(AMENDMENT_STATUS) as [AmendmentStatus, ...AmendmentStatus[]]);
