import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactModule } from './contact/contact.module';
import { ConfigTypOrmModule } from './config/typeorm.module';
import { ConfigModuleRoot } from './config/configGlobal.database';

@Module({
  imports: [ConfigModuleRoot, ConfigTypOrmModule, ContactModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
