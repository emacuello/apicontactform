import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { envs } from './env';

const configDatabase = {
  type: 'postgres',
  database: envs.DB_NAME,
  host: envs.DB_HOST,
  port: envs.DB_PORT,
  username: envs.DB_USERNAME,
  password: envs.DB_PASSWORD,
  entities: ['dist/**/*.entity{.ts,.js}'],
  // synchronize: true,
  logging: true,
  //   dropSchema: true,
  migrations: ['dist/migrations/*.{ts,js}'],
  // ssl: true,
};

export default registerAs('database', () => configDatabase);

export const dbConfig = new DataSource(configDatabase as DataSourceOptions);
