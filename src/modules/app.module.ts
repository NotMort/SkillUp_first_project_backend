import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { configValidationSchema } from 'config/schema.config'
import { LoggerMiddleware } from 'middleware/logger.middleware'

import { AuthModule } from './auth/auth.module'

import { DatabaseModule } from './database/database.module'

import { PermissionsGuard } from './permissions/guards/permission.guard'
import { PermissionsModule } from './permissions/permissions.module'

import { RolesModule } from './roles/roles.module'
import { UsersModule } from './users/users.module'
import { BidsModule } from './bids/bids.module'
import { AuctionsModule } from './auctions/auctions.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.example`], //${process.env.STAGE}
      validationSchema: configValidationSchema,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    BidsModule,
    AuctionsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
