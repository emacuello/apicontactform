import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact) private contactRepository: Repository<Contact>,
  ) {}
  async create(createContactDto: CreateContactDto, request: Request) {
    const xForwardedFor = request.headers['x-forwarded-for'];
    const ip = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor || request.ip;
    console.log(`IP address: ${ip}`);

    const contact = this.contactRepository.create({
      ...createContactDto,
      ip,
    });
    if (!contact) throw new BadRequestException('Error al crear la solicitud');
    const newContact = await this.contactRepository.save(contact);
    if (!newContact)
      throw new BadRequestException('Error al crear la solicitud');
    return {
      message: 'Solicitud creada correctamente',
    };
  }
}
