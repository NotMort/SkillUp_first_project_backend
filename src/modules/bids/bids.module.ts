// bids.module.ts

import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BidsController } from './bids.controller'
import { BidsService } from './bids.service'
import { Bid } from 'entities/bid.entity'
import { AuctionsModule } from 'modules/auctions/auctions.module'
import { UsersModule } from 'modules/users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Bid]), forwardRef(() => AuctionsModule), forwardRef(() => UsersModule)],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}
