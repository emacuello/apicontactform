import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/env';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),
    ClientsModule.register([
      {
        name: 'CONTACT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [envs.HOST_RMQ],
          queue: envs.QUEUE_RMQ,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    JwtModule.register({
      global: true,
      secret: envs.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
