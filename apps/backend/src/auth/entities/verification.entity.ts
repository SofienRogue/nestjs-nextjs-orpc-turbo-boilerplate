import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('verification')
export class Verification {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { name: 'identifier' })
  identifier!: string;

  @Column('text', { name: 'value' })
  value!: string;

  @Column('date', { name: 'expiresAt' })
  expiresAt!: Date;

  @Column('date', { name: 'createdAt' })
  createdAt!: Date;

  @Column('date', { name: 'updatedAt' })
  updatedAt!: Date;

}