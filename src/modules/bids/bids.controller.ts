import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ClassSerializerInterceptor,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common'
import { BidsService } from './bids.service'
import { Bid } from 'entities/bid.entity'
import { ApiOperation, ApiParam, ApiBody, ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from 'decorators/get-current-user.decorator' // Import your CurrentUser decorator
import { User } from 'entities/user.entity' // Assuming you have a User entity

@Controller('bids')
@ApiTags('Bids')
@UseInterceptors(ClassSerializerInterceptor)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post(':auctionId')
  @ApiOperation({ summary: 'Place a bid on an auction' })
  @ApiParam({
    name: 'auctionId',
    type: String,
    description: 'ID of the auction',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bidAmount: { type: 'number', description: 'Amount of the bid' },
      },
    },
  })
  async placeBid(
    @Param('auctionId') auctionId: string,
    @GetCurrentUser() user: User,
    @Body('amount') bidAmount: number,
  ): Promise<Bid> {
    console.log('Current user:', user)
    return await this.bidsService.placeBid(auctionId, user.id, bidAmount)
  }
  @Get('/user')
  @ApiOperation({ summary: 'Get all bids placed by the current user' })
  async getUserBids(@GetCurrentUser() user: User): Promise<Bid[]> {
    return this.bidsService.getBidsByBidderId(user.id)
  }
  @Get(':auctionId')
  @ApiOperation({
    description: 'Retrieve all bids for a specific auction',
  })
  @ApiParam({
    name: 'auctionId',
    description: 'The ID of the auction',
  })
  async getBidsByAuctionId(@Param('auctionId') auctionId: string): Promise<Bid[]> {
    return await this.bidsService.getBidsByAuctionId(auctionId)
  }

  @Get('bidder/:bidderId')
  @ApiOperation({
    description: 'Retrieve all bids for a specific bidder',
  })
  @ApiParam({
    name: 'bidderId',
    description: 'The ID of the bidder',
  })
  async getBidsByBidderId(@Param('bidderId', new ParseUUIDPipe({ version: '4' })) bidderId: string): Promise<Bid[]> {
    return await this.bidsService.getBidsByBidderId(bidderId)
  }
}
