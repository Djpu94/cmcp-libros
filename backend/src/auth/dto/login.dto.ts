import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@cmcp.cl' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 6, format: 'password' })
  @IsString()
  @MinLength(6)
  password!: string;
}
