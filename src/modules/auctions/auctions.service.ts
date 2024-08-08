// auctions.service.ts

import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AbstractService } from '../common/abstract.service'
import Logging from 'library/Logging'
import { CreateUpdateAuctionDto } from './dto/create-update-auction.dto'
import { Auction } from 'entities/auction.entity'
import { User } from 'entities/user.entity'
import { join } from 'path'
import { isFileExtensionSafe, removeFile } from 'helpers/imageStorage'
import * as cron from 'node-cron'

@Injectable()
export class AuctionService extends AbstractService {
  constructor(
    @InjectRepository(Auction)
    private readonly AuctionsRepository: Repository<Auction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    cron.schedule('0 * * * *', async () => {
      const Auctions = await this.findAll()
      Auctions.forEach(async (item) => {
        await this.checkAuctionStatus(item)
      })
    })
    super(AuctionsRepository)
  }

  async findAuctionByAuctionId(id: string): Promise<Auction> {
    try {
      return this.AuctionsRepository.findOneOrFail({ where: { id } })
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while searching for the auction item.')
    }
  }

  async findWon(userId: string): Promise<Auction[]> {
    const status = 'Winning'
    const now = new Date().toISOString()
    try {
      const winnings = await this.AuctionsRepository.createQueryBuilder()
        .select('auction_item')
        .from(Auction, 'auction_item')
        .leftJoinAndSelect('auction_item.bids', 'bids')
        .where('bids.user_id = :userId', { userId })
        .andWhere('bids.status = :status', { status: status })
        .andWhere('auction_item.end_date < :now', { now: now })
        .getMany()

      return winnings
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for a paginated elements.')
    }
  }

  async findWinning(userId: string): Promise<Auction[]> {
    const status = 'Winning'
    const now = new Date().toISOString()
    try {
      const winnings = await this.AuctionsRepository.createQueryBuilder()
        .select('auction_item')
        .from(Auction, 'auction_item')
        .leftJoinAndSelect('auction_item.bids', 'bids')
        .where('bids.user_id = :userId', { userId })
        .andWhere('bids.status = :status', { status: status })
        .andWhere('auction_item.end_date > :now', { now: now })
        .getMany()

      return winnings
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for a paginated elements.')
    }
  }

  async create(createAuctionDto: CreateUpdateAuctionDto, userId: string): Promise<Auction> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) {
        throw new BadRequestException('User not found')
      }
      const auction = this.AuctionsRepository.create({
        ...createAuctionDto,
        user: user,
      })
      return this.AuctionsRepository.save(auction)
    } catch (error) {
      throw new InternalServerErrorException('Error creating auction')
    }
  }

  async handleFileUpload(file, auction_item_id) {
    const filename = file?.filename

    if (!filename) {
      throw new BadRequestException('File must be a png, jpg/jpeg')
    }

    const imagesFolderPath = join(process.cwd(), 'files')
    const fullImagePath = join(imagesFolderPath + '/' + file.filename)

    if (await isFileExtensionSafe(fullImagePath)) {
      return this.updateAuctionImage(auction_item_id, filename)
    }

    removeFile(fullImagePath)
    throw new BadRequestException('File content does not match extension!')
  }

  async update(AuctionId: string, createUpdateAuctionDto: CreateUpdateAuctionDto): Promise<Auction> {
    const Auction = (await this.findById(AuctionId)) as Auction

    try {
      Auction.title = createUpdateAuctionDto.title
      Auction.description = createUpdateAuctionDto.description
      Auction.image = createUpdateAuctionDto.image
      Auction.start_price = createUpdateAuctionDto.start_price
      Auction.end_date = createUpdateAuctionDto.end_date

      return this.AuctionsRepository.save(Auction)
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while updating the auction item.')
    }
  }

  async updateAuctionImage(id: string, image: string): Promise<Auction> {
    const Auction = await this.findById(id)

    return this.update(Auction.id, { ...Auction, image })
  }

  async fetchByUser(userId: string): Promise<Auction[]> {
    try {
      const auctions = await this.AuctionsRepository.createQueryBuilder()
        .select('auction_item')
        .from(Auction, 'auction_item')
        .leftJoinAndSelect('auction_item.bids', 'bids')
        .where('auction_item.user_id = :userId', { userId })
        .getMany()
      console.log(userId)
      return auctions
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for elements.')
    }
  }

  async findBidded(userId: string): Promise<Auction[]> {
    try {
      const bidded = await this.AuctionsRepository.createQueryBuilder()
        .select('auction_item')
        .from(Auction, 'auction_item')
        .leftJoinAndSelect('auction_item.bids', 'bids')
        .where('bids.user_id = :userId', { userId })
        .getMany()

      return bidded
    } catch (error) {
      Logging.error(error)
      throw new InternalServerErrorException('Something went wrong while searching for elements.')
    }
  }

  async checkAuctionStatus(Auction: Auction) {
    // calculate time left
    const timeLeft = new Date(Auction.end_date).getTime() - new Date().getTime()
    const hoursLeft = timeLeft / (1000 * 60 * 60)
  }

  // auctions.service.ts
  async findEndingSoon(): Promise<Auction[]> {
    try {
      return this.AuctionsRepository.find({
        order: { end_date: 'ASC' },
        take: 10,
      })
    } catch (error) {
      throw new InternalServerErrorException('Error fetching auctions ending soon.')
    }
  }

  async findNewest(): Promise<Auction[]> {
    try {
      return this.AuctionsRepository.find({
        order: { created_at: 'DESC' },
        take: 10,
      })
    } catch (error) {
      throw new InternalServerErrorException('Error fetching recent auctions.')
    }
  }

  async findOne(id: string): Promise<Auction> {
    return this.AuctionsRepository.findOne({
      where: { id },
      relations: ['bids'],
    })
  }
}
