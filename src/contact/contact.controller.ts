import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
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
  async create(@Body() createContactDto: CreateContactDto, @Req() req: Request) {
    return await this.contactService.create(createContactDto, req);
  }

  @Get('test')
  async test() {
    return await this.contactService.test();
  }
}
