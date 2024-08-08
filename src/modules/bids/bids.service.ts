import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Bid } from 'entities/bid.entity'
import { AuctionService } from 'modules/auctions/auctions.service'
import { UsersService } from 'modules/users/users.service'
import { AbstractService } from 'modules/common/abstract.service'
import { Auction } from 'entities/auction.entity'
import { User } from 'entities/user.entity'

@Injectable()
export class BidsService extends AbstractService {
  constructor(
    @InjectRepository(Bid) private readonly bidsRepository: Repository<Bid>,
    @Inject(forwardRef(() => AuctionService)) private readonly auctionsService: AuctionService,
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
  ) {
    super(bidsRepository)
  }

  async placeBid(auctionId: string, bidderId: string, bidAmount: number): Promise<Bid> {
    const auction: Auction = await this.auctionsService.findById(auctionId)
    if (!auction) {
      throw new NotFoundException('Auction item not found')
    }

    const bidder: User = await this.usersService.findById(bidderId)
    if (!bidder) {
      throw new NotFoundException('Bidder not found')
    }

    console.log('Bid amount received:', bidAmount) // Log received bid amount

    const bid = new Bid()
    bid.auction = auction
    bid.bidder = bidder
    bid.bid_amount = bidAmount // Ensure this is set correctly
    bid.status = ''

    const otherBids = await this.bidsRepository.find({
      where: { auction: { id: auctionId } },
    })

    const isWinning = otherBids.every((b) => bidAmount > b.bid_amount)

    if (isWinning) {
      bid.status = 'Winning'
      otherBids.forEach((b) => {
        b.status = 'Outbid'
        this.bidsRepository.save(b)
      })
    } else {
      bid.status = 'Outbid'
    }

    return await this.bidsRepository.save(bid)
  }

  async getBidsByAuctionId(auctionId: string): Promise<Bid[]> {
    const auction = await this.auctionsService.findById(auctionId)
    if (!auction) {
      throw new NotFoundException('Auction item not found')
    }

    return this.bidsRepository.find({
      where: { auction: { id: auctionId } },
      relations: ['auction', 'bidder'],
    })
  }

  async getBidsByBidderId(bidderId: string): Promise<Bid[]> {
    return this.repository.find({
      where: { 'bidder.id': bidderId },
      relations: ['auction', 'bidder'],
    })
  }

  async getHighestBidder(auctionId: string): Promise<Bid> {
    const auction = await this.auctionsService.findById(auctionId)

    if (!auction) {
      throw new NotFoundException('Auction item not found')
    }

    const bids = await this.repository.find({
      where: { 'auction.id': auctionId },
      relations: ['auction', 'bidder'],
    })

    bids.sort((a, b) => b.bid_amount - a.bid_amount)

    return bids[0]?.bidder?.id
  }

  async getAllBids(auctionId: string): Promise<Bid> {
    const auction = await this.findById(auctionId)

    if (!auction) {
      throw new NotFoundException('Auction item not found')
    }

    const bids = await this.findById(auctionId, ['bids'])

    return bids
  }
}
