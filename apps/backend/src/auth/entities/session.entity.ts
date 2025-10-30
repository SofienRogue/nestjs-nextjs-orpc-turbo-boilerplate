import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('session')
export class Session {
  @PrimaryColumn('text')
  id!: string;

  @Column('date', { name: 'expiresAt' })
  expiresAt!: Date;

  @Column('text', { name: 'token', unique: true })
  token!: string;

  @Column('date', { name: 'createdAt' })
  createdAt!: Date;

  @Column('date', { name: 'updatedAt' })
  updatedAt!: Date;

  @Column('text', { name: 'ipAddress', nullable: true })
  ipAddress: string | null;

  @Column('text', { name: 'userAgent', nullable: true })
  userAgent: string | null;

  @Column('text', { name: 'userId' })
  userId!: string;

  @Column('text', { name: 'activeOrganizationId', nullable: true })
  activeOrganizationId: string | null;

}