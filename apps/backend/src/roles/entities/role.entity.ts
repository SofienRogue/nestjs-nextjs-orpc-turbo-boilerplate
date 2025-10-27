import EntityHelper from '../../utils/entities/entity-helper.js';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { RoleCodeEnum } from '../roles.enum.js';

@Entity({ name: 'role' })
export class Role extends EntityHelper {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int', default: RoleCodeEnum.USER })
  code: RoleCodeEnum;
}
