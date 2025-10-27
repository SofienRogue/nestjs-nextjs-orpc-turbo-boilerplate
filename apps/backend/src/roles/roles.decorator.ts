import { applyDecorators, SetMetadata } from '@nestjs/common';

export const Roles = (...roles: number[]) => {
  return applyDecorators(SetMetadata('roles', roles));
};
