import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';

@Module({
  imports: [DatabaseModule, FeatureFlagsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}