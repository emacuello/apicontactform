import { Module } from '@nestjs/common';
import { ContactService } from './contact.service.js';
import { ContactController } from './contact.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from '../config/env.js';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
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
