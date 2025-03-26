import { SetMetadata } from '@nestjs/common';

export const METADATA_RBAC = 'rbac';
export const Rbac = (...roles: string[]) => SetMetadata(METADATA_RBAC, roles);
