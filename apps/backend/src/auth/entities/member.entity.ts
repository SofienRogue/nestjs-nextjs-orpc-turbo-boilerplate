import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('member')
export class Member {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { name: 'organizationId' })
  organizationId!: string;

  @Column('text', { name: 'userId' })
  userId!: string;

  @Column('text', { name: 'role' })
  role!: string;

  @Column('date', { name: 'createdAt' })
  createdAt!: Date;

}