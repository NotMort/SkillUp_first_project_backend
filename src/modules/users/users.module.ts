// users.module.ts

import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'entities/user.entity'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { AuctionsModule } from 'modules/auctions/auctions.module'
import { BidsModule } from 'modules/bids/bids.module'
import { AuthModule } from 'modules/auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuctionsModule),
    forwardRef(() => BidsModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
