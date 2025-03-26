import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
