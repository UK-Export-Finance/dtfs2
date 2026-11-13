import zod from 'zod';
import { TFM_AMENDMENT_STATUS, TfmAmendmentStatus } from '@ukef/dtfs2-common';

export const AmendmentStatusSchema = zod.enum(Object.values(TFM_AMENDMENT_STATUS) as [TfmAmendmentStatus, ...TfmAmendmentStatus[]]);
