import { configDotenv } from 'dotenv';
import 'dotenv/config';
import * as joi from 'joi';
configDotenv({ path: '.env.development' });
interface Env {
  HOST_REDIS: string;
  PORT_REDIS: number;
  PASSWORD_REDIS: string;
}
const envsSchema = joi
  .object({
    HOST_REDIS: joi.string().required(),
    PORT_REDIS: joi.number().required(),
    PASSWORD_REDIS: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
export const envs = value as Env;
