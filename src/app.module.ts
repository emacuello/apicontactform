import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ContactModule } from './contact/contact.module.js';
import { ConfigTypOrmModule } from './config/typeorm.module.js';
import { ConfigModuleRoot } from './config/configGlobal.database.js';

@Module({
  imports: [ConfigModuleRoot, ConfigTypOrmModule, ContactModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
