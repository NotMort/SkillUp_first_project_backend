import { Injectable, BadRequestException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from 'entities/user.entity'
import { PostgresErrorCode } from 'helpers/postgresErrorCode.enum'
import Logging from 'library/Logging'
import { AbstractService } from 'modules/common/abstract.service'
import { compareHash, hash } from 'utils/bcrypt'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { AuctionService } from 'modules/auctions/auctions.service'
import { BidsService } from 'modules/bids/bids.service'
import { ModuleRef } from '@nestjs/core'

@Injectable()
export class UsersService extends AbstractService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @Inject(forwardRef(() => AuctionService)) private readonly auctionService: AuctionService,
    @Inject(forwardRef(() => BidsService)) private readonly bidsService: BidsService,
  ) {
    super(usersRepository)
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findBy({ email: createUserDto.email })
    if (user) {
      throw new BadRequestException('User with that email already exists.')
    }
    try {
      const newUser = this.usersRepository.create({ ...createUserDto, role: { id: createUserDto.role_id } })
      return this.usersRepository.save(newUser)
    } catch (error) {
      Logging.error(error)
      throw new BadRequestException('Something went wrong while creating a new user.')
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = (await this.findById(id)) as User
    const { email, password, confirm_password, role_id, ...data } = updateUserDto
    if (user.email !== email && email) {
      user.email = email
    }
    if (password && confirm_password) {
      if (password !== confirm_password) {
        throw new BadRequestException('Passwords do not match.')
      }
      if (await compareHash(password, user.password)) {
        throw new BadRequestException('New password cannot be the same as your old password.')
      }
      user.password = await hash(password)
    }
    if (role_id) {
      user.role = { ...user.role, id: role_id }
    }
    try {
      Object.entries(data).map((entry) => {
        user[entry[0]] = entry[1]
      })
      return this.usersRepository.save(user)
    } catch (error) {
      Logging.error(error)
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with that email already exists.')
      }
      throw new InternalServerErrorException('Something went wrong while updating the user.')
    }
  }

  async updateUserImageId(id: string, avatar: string): Promise<User> {
    const user = await this.findById(id)
    return this.update(user.id, { avatar })
  }

  async fetchUserAuctions(userId: string): Promise<any> {
    return this.auctionService.fetchByUser(userId)
  }

  async fetchUserBids(userId: string): Promise<any> {
    return this.bidsService.getBidsByBidderId(userId)
  }
}
