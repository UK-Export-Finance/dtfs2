import { Column, UpdateDateColumn } from 'typeorm';
import { DbRequestSource } from '../helpers';

export abstract class AuditableBaseEntity {
  @UpdateDateColumn()
  lastUpdatedAt!: Date;

  @Column({ type: 'nvarchar', nullable: true })
  lastUpdatedByPortalUserId!: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  lastUpdatedByTfmUserId!: string | null;

  @Column({ default: false })
  lastUpdatedByIsSystemUser!: boolean;

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
