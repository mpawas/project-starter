import { defineConfig } from 'drizzle-kit';
import path from 'node:path';

export default defineConfig({
  schema: [
    path.resolve(__dirname, 'src/modules/*/*.schema.ts'),
    path.resolve(__dirname, 'src/modules/*/*/*.schema.ts'),
    path.resolve(__dirname, 'src/modules/*/*/*/*.schema.ts'),
    path.resolve(__dirname, 'src/modules/*/service/*.schema.ts'),
    path.resolve(__dirname, 'src/modules/*/*/service/*.schema.ts'),
    path.resolve(__dirname, 'src/modules/*/*/*/service/*.schema.ts'),
    path.resolve(__dirname, 'src/modules/*/services/*.schema.ts'),
    path.resolve(__dirname, 'src/modules/*/*/services/*.schema.ts'),
    path.resolve(__dirname, 'src/modules/*/*/*/services/*.schema.ts'),
  ],
  dialect: 'postgresql',
  out: './migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
});
