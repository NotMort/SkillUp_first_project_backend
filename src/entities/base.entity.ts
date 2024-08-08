import { ApiProperty } from '@nestjs/swagger'
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { IsUUID } from 'class-validator'
import { Expose } from 'class-transformer'

export class Base {
  @ApiProperty({
    description: 'The ID',
    example: '3fa8f3344562dasgc963f66ddsa6',
  })
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  @IsUUID()
  id: string

  @ApiProperty({
    description: 'The creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  @Expose()
  created_at: Date

  @ApiProperty({
    description: 'The update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  @Expose()
  updated_at: Date
}
