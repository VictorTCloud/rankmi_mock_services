import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AltasController } from './altas/altas.controller';
import { HealthController } from './health/health.controller';
import { MockRecordsService } from './mock/mock-records.service';
import { SegurosBolivarController } from './seguros-bolivar/seguros-bolivar.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  controllers: [HealthController, SegurosBolivarController, AltasController],
  providers: [MockRecordsService],
})
export class AppModule {}
