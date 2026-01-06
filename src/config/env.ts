import 'dotenv/config';
import * as joi from 'joi';
interface Env {
  HOST_REDIS: string;
  PORT_REDIS: number;
  PASSWORD_REDIS: string;
  PORT: number;
  HOST_RMQ: string;
  QUEUE_RMQ: string;
  DB_URL: string;
  CUSTOM_HEADER_KEY: string;
  CUSTOM_HEADER_VALUE: string;
}
const envsSchema = joi
  .object({
    HOST_REDIS: joi.string().required(),
    PORT_REDIS: joi.number().required(),
    PASSWORD_REDIS: joi.string().required(),
    PORT: joi.number().required(),
    DB_URL: joi.string().required(),
    HOST_RMQ: joi.string().required(),
    QUEUE_RMQ: joi.string().required(),
    CUSTOM_HEADER_KEY: joi.string().required(),
    CUSTOM_HEADER_VALUE: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
export const envs = value as Env;
