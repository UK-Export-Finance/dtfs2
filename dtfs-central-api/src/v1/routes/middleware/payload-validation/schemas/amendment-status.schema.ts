import z from 'zod';
import { AMENDMENT_STATUS, AmendmentStatus } from '@ukef/dtfs2-common';

export const AmendmentStatusSchema = z.enum(Object.values(AMENDMENT_STATUS) as [AmendmentStatus, ...AmendmentStatus[]]);
