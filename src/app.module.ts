import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BondModule } from './bond/bond.module';

@Module({
  imports: [BondModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
