import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  constructor(
    @InjectRepository(Contact) private contactRepository: Repository<Contact>,
    @Inject('CONTACT_SERVICE') private client: ClientProxy,
  ) {}
  async create(createContactDto: CreateContactDto, request: Request) {
    const xForwardedFor = request.headers['x-forwarded-for'];
    const ip = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor || request.ip;
    this.logger.log(`IP address: ${ip}`);

    const contact = this.contactRepository.create({
      ...createContactDto,
      ip,
    });
    if (!contact) throw new BadRequestException('Error al crear la solicitud');
    const newContact = await this.contactRepository.save(contact);
    if (!newContact)
      throw new BadRequestException('Error al crear la solicitud');
    this.logger.log('Emitiendo evento a Redis...');
    try {
      if (createContactDto.subject) {
        await this.client
          .emit({ cmd: 'createMailContact2' }, createContactDto)
          .toPromise();
      } else {
        await this.client
          .emit({ cmd: 'createMailContact' }, createContactDto)
          .toPromise();
      }
      this.logger.log('Evento emitido correctamente.');
    } catch (error) {
      this.logger.error('Error al emitir el evento a Redis:', error);
    }

    return {
      message: 'Solicitud creada correctamente',
    };
  }
}
