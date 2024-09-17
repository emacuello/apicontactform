import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { envs } from './env';

const configDatabase = {
  type: 'postgres',
  url: envs.DB_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  // synchronize: true,
  logging: true,
  //   dropSchema: true,
  migrations: ['dist/migrations/*.{ts,js}'],
  // ssl: true,
};

export default registerAs('database', () => configDatabase);

export const dbConfig = new DataSource(configDatabase as DataSourceOptions);
