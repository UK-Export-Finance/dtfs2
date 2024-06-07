import { TEAM_IDS, TeamId } from '@ukef/dtfs2-common';
import z from 'zod';

export const TfmTeamSchema = z.enum(Object.values(TEAM_IDS) as [TeamId, ...TeamId[]]);
