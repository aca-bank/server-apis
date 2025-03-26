import { SetMetadata } from '@nestjs/common';

export const METADATA_NO_AUTHORIZE = 'no-authorize';
export const IsPublic = () => SetMetadata(METADATA_NO_AUTHORIZE, true);
