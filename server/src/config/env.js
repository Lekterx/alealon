const { z } = require('zod');

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().default(10),
  APP_URL: z.string().url().default('http://localhost:5174'),
});

let env;
try {
  env = envSchema.parse(process.env);
} catch (err) {
  console.error('Invalid environment variables:', err.flatten().fieldErrors);
  process.exit(1);
}

module.exports = env;
