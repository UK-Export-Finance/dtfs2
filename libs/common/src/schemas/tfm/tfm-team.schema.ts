import z from 'zod';
import { TEAM_IDS } from '../../constants';
import { TeamId } from '../../types';

/**
 * The schema for TFM teams that control role based access control (RBAC) in TFM
 */
export const TfmTeamSchema = z.enum(Object.values(TEAM_IDS) as [TeamId, ...TeamId[]]);
