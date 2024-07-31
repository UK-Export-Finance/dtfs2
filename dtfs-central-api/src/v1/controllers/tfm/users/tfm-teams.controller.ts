import { Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { TfmTeamsRepo } from '../../../../repositories/tfm-teams-repo';

export const getTfmTeamByTeamId = async (req: Request, res: Response) => {
  const { teamId } = req.params;

  try {
    const team = await TfmTeamsRepo.findOneByTeamId(teamId);
    if (!team) {
      return res.status(HttpStatusCode.NotFound).send(`Failed to find a tfm team with id '${teamId}'`);
    }
    return res.status(HttpStatusCode.Ok).send({ team });
  } catch (error) {
    return res.status(HttpStatusCode.InternalServerError).send('Failed to find tfm team by id');
  }
};
