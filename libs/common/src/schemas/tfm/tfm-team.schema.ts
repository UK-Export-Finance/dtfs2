import z from 'zod';
import { TEAM_IDS } from '../../constants';
import { TeamId } from '../../types';

export const TfmTeamSchema = z.enum(Object.values(TEAM_IDS) as [TeamId, ...TeamId[]]);
