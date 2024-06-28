import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CustomHeaderGuard } from './guards/customHeaders.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UseGuards(CustomHeaderGuard, ThrottlerGuard)
  create(@Body() createContactDto: CreateContactDto, @Req() req: Request) {
    return this.contactService.create(createContactDto, req);
  }
}
