import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class LoginUserDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsEmail()
  email: string
  @ApiProperty({ required: false })
  @IsNotEmpty()
  password: string
}
