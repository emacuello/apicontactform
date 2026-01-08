import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CustomHeaderGuard } from './guards/customHeaders.guard';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard';
import { CaptchaGuard } from './guards/captcha.guard';
import { envs } from 'src/config/env';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService, private readonly jwt: JwtService) {}

  @Post()
  @UseGuards(JwtGuard, ThrottlerGuard, CaptchaGuard)
  async create(@Body() createContactDto: CreateContactDto, @Req() req: Request) {
    return await this.contactService.create(createContactDto, req);
  }
  

  @Post('form-token')
  @UseGuards(CustomHeaderGuard, ThrottlerGuard)
  getFormToken() {
    return {
      token: this.jwt.sign(
        { purpose: envs.QUEUE_RMQ }
      ),
    };
  }

}
