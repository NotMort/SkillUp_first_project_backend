import { ApiProperty } from '@nestjs/swagger'
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Auction } from './auction.entity'
import { User } from './user.entity'
import { Base } from './base.entity'

@Entity()
export class Bid extends Base {
  @ApiProperty({ description: 'The bid amount', example: 100 })
  @Column({ type: 'int' })
  bid_amount: number

  @ApiProperty({
    description: 'The status of the bid',
    example: 'Pending',
    nullable: true,
  })
  @Column({ nullable: true })
  status: string

  @ApiProperty({ description: 'The user who made the bid', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  bidder: User

  @ApiProperty({
    description: 'The auction item that was bid on',
    type: () => Auction,
  })
  @ManyToOne(() => Auction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'auction_id' })
  auction: Auction
}
