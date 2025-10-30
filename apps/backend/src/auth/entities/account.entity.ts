import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('account')
export class Account {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { name: 'accountId' })
  accountId!: string;

  @Column('text', { name: 'providerId' })
  providerId!: string;

  @Column('text', { name: 'userId' })
  userId!: string;

  @Column('text', { name: 'accessToken', nullable: true })
  accessToken: string | null;

  @Column('text', { name: 'refreshToken', nullable: true })
  refreshToken: string | null;

  @Column('text', { name: 'idToken', nullable: true })
  idToken: string | null;

  @Column('date', { name: 'accessTokenExpiresAt', nullable: true })
  accessTokenExpiresAt: Date | null;

  @Column('date', { name: 'refreshTokenExpiresAt', nullable: true })
  refreshTokenExpiresAt: Date | null;

  @Column('text', { name: 'scope', nullable: true })
  scope: string | null;

  @Column('text', { name: 'password', nullable: true })
  password: string | null;

  @Column('date', { name: 'createdAt' })
  createdAt!: Date;

  @Column('date', { name: 'updatedAt' })
  updatedAt!: Date;

}