import { Column, UpdateDateColumn } from 'typeorm';
import { DbRequestSource } from '../helpers';

export abstract class AuditableBaseEntity {
  /**
   * The time where the entity was last updated
   */
  @UpdateDateColumn()
  lastUpdatedAt!: Date;

  /**
   * The user id of the portal user who last updated the entity
   * (null if the last update came from a non-portal user)
   */
  @Column({ type: 'nvarchar', nullable: true })
  lastUpdatedByPortalUserId!: string | null;

  /**
   * The user id of the tfm user who last updated the entity
   * (null if the last update came from a non-tfm user)
   */
  @Column({ type: 'nvarchar', nullable: true })
  lastUpdatedByTfmUserId!: string | null;

  /**
   * Whether or not the entity was last updated by the system
   */
  @Column({ default: false })
  lastUpdatedByIsSystemUser!: boolean;

  /**
   * Updates the audit fields
   * @param requestSource - The request source
   */
  public updateLastUpdatedBy(requestSource: DbRequestSource): void {
    const { platform } = requestSource;
    switch (platform) {
      case 'PORTAL':
        this.lastUpdatedByPortalUserId = requestSource.userId;
        this.lastUpdatedByTfmUserId = null;
        this.lastUpdatedByIsSystemUser = false;
        return;
      case 'TFM':
        this.lastUpdatedByPortalUserId = null;
        this.lastUpdatedByTfmUserId = requestSource.userId;
        this.lastUpdatedByIsSystemUser = false;
        return;
      case 'SYSTEM':
        this.lastUpdatedByPortalUserId = null;
        this.lastUpdatedByTfmUserId = null;
        this.lastUpdatedByIsSystemUser = true;
        return;
      default:
        throw new Error(`Request source platform '${platform}' not recognised`);
    }
  }
}
