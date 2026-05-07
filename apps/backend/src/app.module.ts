import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { HealthController } from './health/health.controller';
import { RolesModule } from './modules/roles/roles.module';
import { databaseConfig } from './config/database.config';
import { validateEnvironment } from './config/validate-environment';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validate: validateEnvironment,
    }),
    DrizzleModule,
    AuthModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [HealthController],
})
export class AppModule { }
