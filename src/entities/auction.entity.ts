import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { Base } from './base.entity'
import { Bid } from './bid.entity'
import { User } from './user.entity'

@Entity()
export class Auction extends Base {
  @ApiProperty({
    description: 'The title of the auction ',
    example: 'Nintendo Ds',
    nullable: true,
  })
  @Column({ nullable: true })
  title: string

  @ApiProperty({
    description: 'The description of the auction',
    example: 'Gaming console',
    nullable: true,
  })
  @Column({ nullable: true })
  description: string

  @ApiProperty({
    description: 'The image of the auction',
    example: 'Nintendo.jpg',
    nullable: true,
  })
  @Column({ nullable: true })
  image?: string

  @ApiProperty({
    description: 'The start price of the auction',
    example: 110,
    nullable: true,
  })
  @Column({ nullable: true })
  start_price: number

  @ApiProperty({
    description: 'The end date of the auction',
    example: '2024-12-31',
    nullable: true,
  })
  @Column({ nullable: true })
  end_date: string

  @ApiProperty({
    description: 'The bids for the auction',
    type: () => [Bid],
  })
  @OneToMany(() => Bid, (bid) => bid.auction, {
    eager: true,
  })
  bids: Bid[]

  @ApiProperty({
    description: 'The user who posted the auction',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User
}
