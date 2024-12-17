import { Column } from 'typeorm';

export class RequestedByUserPartialEntity {
  /**
   * The requested by user's id
   */
  @Column({ type: 'nvarchar' })
  id!: string;

  /**
   * The requested by user's first name
   */
  @Column({ type: 'nvarchar' })
  firstName!: string;

  /**
   * The requested by user's last name
   */
  @Column({ type: 'nvarchar' })
  lastName!: string;
}
