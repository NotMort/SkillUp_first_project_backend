import { Exclude } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { Base } from './base.entity'
import { Bid } from './bid.entity'
import { Auction } from './auction.entity'
import { ApiProperty } from '@nestjs/swagger'
import { Role } from './role.entity'

@Entity()
export class User extends Base {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'Ana',
    nullable: true,
  })
  @Column({ nullable: true })
  first_name: string

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    nullable: true,
  })
  @Column({ nullable: true })
  last_name: string

  @ApiProperty({
    description: 'The email of the user',
    example: 'ana@example.com',
  })
  @Column({ unique: true })
  email: string

  @ApiProperty({
    description: 'The avatar of the user',
    example: 'avatar.jpg',
    nullable: true,
  })
  @Column({ nullable: true })
  avatar: string

  @ApiProperty({
    description: 'The password of the user',
    example: '123',
    nullable: true,
  })
  @Column({ nullable: true })
  @Exclude()
  password: string

  @ApiProperty({
    type: () => [Auction],
    description: 'The auction of the user',
  })
  @OneToMany(() => Auction, (auction) => auction.user)
  auctions: Auction[]

  @ApiProperty({ type: () => [Bid], description: 'The bids of the user' })
  @OneToMany(() => Bid, (bid) => bid.bidder)
  bids: Bid[]

  @ManyToOne(() => Role, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role: Role | null
}
