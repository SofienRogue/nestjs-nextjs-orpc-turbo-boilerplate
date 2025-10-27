import { StatusCodeEnum } from "../statuses.enum.js";

export class StatusesDto {
  id: number;

  name: string;

  code: StatusCodeEnum;
}
