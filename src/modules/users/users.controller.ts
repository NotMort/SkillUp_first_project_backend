import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiCreatedResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { User } from 'entities/user.entity'
import { isFileExtensionSafe, removeFile, saveImageToStorage } from 'helpers/imageStorage'
import { PaginatedResult } from 'interfaces/paginated-result.interface'
import { join } from 'path'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard'
import { GetCurrentUser } from 'decorators/get-current-user.decorator'
import { Auction } from 'entities/auction.entity'
import { Bid } from 'entities/bid.entity'
import { createReadStream, existsSync } from 'fs'
import { Response } from 'express'
@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({ description: 'List all users.' })
  @ApiBadRequestResponse({ description: 'Error for list of users.' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('page') page: number): Promise<PaginatedResult> {
    return this.usersService.paginate(page, ['role'])
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id)
  }

  @ApiCreatedResponse({ description: 'Creates new user.' })
  @ApiBadRequestResponse({ description: 'Error for creating a new user.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto)
  }

  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('avatar', saveImageToStorage))
  @HttpCode(HttpStatus.CREATED)
  async upload(@UploadedFile() file: Express.Multer.File, @Param('id') id: string): Promise<User> {
    const filename = file?.filename

    if (!filename) throw new BadRequestException('File must be a png, jpg/jpeg')

    const imagesFolderPath = join(process.cwd(), 'files')
    const fullImagePath = join(imagesFolderPath + '/' + file.filename)
    if (await isFileExtensionSafe(fullImagePath)) {
      return this.usersService.updateUserImageId(id, filename)
    }
    removeFile(fullImagePath)
    throw new BadRequestException('File content does not match extension!')
  }
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/auctions')
  async getUserAuctions(@GetCurrentUser() user: User) {
    return this.usersService.fetchUserAuctions(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/bids')
  @HttpCode(HttpStatus.OK)
  async getUserBids(@GetCurrentUser() user: User): Promise<Bid[]> {
    return this.usersService.fetchUserBids(user.id)
  }
  @Get('avatar/:filename')
  async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'files', filename)

    if (!existsSync(filePath)) {
      throw new NotFoundException('Avatar not found')
    }

    const fileStream = createReadStream(filePath)
    fileStream.pipe(res)
  }
}
