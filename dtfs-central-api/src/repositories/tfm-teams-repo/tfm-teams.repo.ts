import { WithoutId, Collection } from 'mongodb';
import { TeamId, TfmTeam } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../drivers/db-client';

export class TfmTeamsRepo {
  private static async getCollection(): Promise<Collection<WithoutId<TfmTeam>>> {
    return await mongoDbClient.getCollection('tfm-teams');
  }

  /**
   * Finds a tfm team by the team id
   * @param teamId - The team id to search for
   * @returns The found team or null if not found
   */
  public static async findOneByTeamId(teamId: string): Promise<TfmTeam | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ id: { $eq: teamId as TeamId } });
  }
}
