// auctions.module.ts

import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuctionService } from './auctions.service'
import { auctionsController } from './auctions.controller'
import { Auction } from 'entities/auction.entity'
import { User } from 'entities/user.entity'
import { UsersModule } from 'modules/users/users.module'
import { BidsModule } from 'modules/bids/bids.module'

@Module({
  imports: [TypeOrmModule.forFeature([Auction, User]), forwardRef(() => UsersModule), forwardRef(() => BidsModule)],
  controllers: [auctionsController],
  providers: [AuctionService],
  exports: [AuctionService],
})
export class AuctionsModule {}
