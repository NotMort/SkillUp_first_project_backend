import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator'

export class CreateUpdateAuctionDto {
  @ApiProperty({
    description: 'The title',
  })
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty({
    description: 'The description',
  })
  @IsNotEmpty()
  @IsString()
  description: string

  @ApiProperty({
    description: 'The starting price',
    minimum: 0,
    default: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  start_price: number

  @ApiProperty({
    description: 'The end date',
  })
  @IsNotEmpty()
  @IsString()
  end_date: string

  @ApiProperty({
    description: 'The image',
  })
  @IsOptional()
  @IsString()
  image?: string
}
