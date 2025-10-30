import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('invitation')
export class Invitation {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { name: 'organizationId' })
  organizationId!: string;

  @Column('text', { name: 'email', unique: true })
  email!: string;

  @Column('text', { name: 'role', nullable: true })
  role: string | null;

  @Column('text', { name: 'status' })
  status!: string;

  @Column('date', { name: 'expiresAt' })
  expiresAt!: Date;

  @Column('text', { name: 'inviterId' })
  inviterId!: string;

}