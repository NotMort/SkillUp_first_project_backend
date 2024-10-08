import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  Post,
  Body,
  UploadedFile,
  Patch,
  Delete,
  Req,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiTags,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiCookieAuth,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger'
import { parse } from 'cookie'
import { saveImageToStorage } from 'helpers/imageStorage'
import { PaginatedResult } from 'interfaces/paginated-result.interface'
import { AuctionService } from './auctions.service'
import { Auction } from 'entities/auction.entity'
import { CreateUpdateAuctionDto } from './dto/create-update-auction.dto'
import { Request } from 'express'
import { GetCurrentUser } from 'decorators/get-current-user.decorator'
import { User } from 'entities/user.entity'

@ApiTags('Auction')
@Controller('auctions')
@UseInterceptors(ClassSerializerInterceptor)
export class auctionsController {
  constructor(private readonly AuctionService: AuctionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Retrieve a paginated list of auction items' })
  @ApiQuery({ name: 'page', description: 'The page number for pagination' })
  async findAll(@Query('page') page: number): Promise<PaginatedResult> {
    return this.AuctionService.paginate(page)
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Retrieve auction items by a specific user' })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  async findByUser(@Param('userId') userId: string): Promise<Auction[]> {
    return this.AuctionService.fetchByUser(userId)
  }

  @Get('bidded/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Retrieve auction items bidded on by a specific user',
  })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  async findBidded(@Param('userId') userId: string): Promise<Auction[]> {
    return this.AuctionService.findBidded(userId)
  }

  @Get('/won/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Retrieve auction items won by a specific user',
  })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  async findWon(@Param('userId') userId: string): Promise<Auction[]> {
    return this.AuctionService.findWon(userId)
  }

  @Get('/winning/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Retrieve auction items currently winning by a specific user',
  })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  async findWinning(@Param('userId') userId: string): Promise<Auction[]> {
    return this.AuctionService.findWinning(userId)
  }

  @Get('auction/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Retrieve an auction item with specific ID',
  })
  @ApiParam({ name: 'id', description: 'The ID of the auction item' })
  async findOne(@Param('id') id: string): Promise<Auction> {
    return this.AuctionService.findAuctionByAuctionId(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    type: CreateUpdateAuctionDto,
    description: 'The auction item details',
  })
  @ApiCookieAuth('user_id')
  @ApiResponse({
    status: 201,
    description: 'The auction item has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description: 'Create a new auction item',
  })
  async create(@Body() createUpdateAuctionDto: CreateUpdateAuctionDto, @GetCurrentUser() user: User): Promise<Auction> {
    console.log(createUpdateAuctionDto.title)
    return this.AuctionService.create(createUpdateAuctionDto, user.id)
  }

  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('image', saveImageToStorage))
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The file to upload',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'The ID of the auction item' })
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully uploaded.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description: 'Upload an image for an auction item',
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Auction> {
    console.log('Content-Type:', req.headers['content-type'])
    console.log('file', file)
    return await this.AuctionService.handleFileUpload(file, id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: CreateUpdateAuctionDto,
    description: 'The updated auction item details',
  })
  @ApiParam({ name: 'id', description: 'The ID of the auction item to update' })
  @ApiResponse({
    status: 200,
    description: 'The auction item has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Update an existing auction item',
  })
  async update(@Param('id') id: string, @Body() createUpdateAuctionDto: CreateUpdateAuctionDto): Promise<Auction> {
    return this.AuctionService.update(id, createUpdateAuctionDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'The ID of the auction item to delete' })
  @ApiResponse({
    status: 200,
    description: 'The auction item has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Delete an existing auction item',
  })
  async remove(@Param('id') id: string): Promise<Auction> {
    return this.AuctionService.remove(id)
  }

  @Get('ending-soon')
  @HttpCode(HttpStatus.OK)
  async getEndingSoonAuctions(): Promise<Auction[]> {
    return this.AuctionService.findEndingSoon()
  }

  @Get('recent')
  @HttpCode(HttpStatus.OK)
  async getRecentAuctions(): Promise<Auction[]> {
    return this.AuctionService.findNewest()
  }
}
