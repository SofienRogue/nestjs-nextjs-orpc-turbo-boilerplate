import { Column, Entity, PrimaryColumn } from 'typeorm';
import { StatusCodeEnum } from '../statuses.enum.js';
import EntityHelper from '../../utils/entities/entity-helper.js';

@Entity({ name: 'status' })
export class Status extends EntityHelper {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int', default: StatusCodeEnum.INACTIVE })
  code: StatusCodeEnum;
}
