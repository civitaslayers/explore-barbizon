// scripts/upload-to-r2.mjs
// Uploads all images from /public/images/places/ to Cloudflare R2
// Usage: node scripts/upload-to-r2.mjs

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync } from 'fs';
import { extname, join } from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const required = [
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_R2_ACCESS_KEY_ID',
  'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
  'CLOUDFLARE_R2_BUCKET',
  'NEXT_PUBLIC_MEDIA_BASE_URL',
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_R2_ACCESS_KEY_ID,
  CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  CLOUDFLARE_R2_BUCKET,
  NEXT_PUBLIC_MEDIA_BASE_URL,
} = process.env;

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const MIME_TYPES = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
};

const SOURCE_DIR = 'public/images/places';

async function upload(filePath, key, contentType) {
  const body = readFileSync(filePath);
  await client.send(new PutObjectCommand({
    Bucket: CLOUDFLARE_R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  console.log(`✓ ${key}`);
  console.log(`  → ${NEXT_PUBLIC_MEDIA_BASE_URL}/${key}`);
}

async function main() {
  let files;
  try {
    files = readdirSync(SOURCE_DIR);
  } catch {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const images = files.filter((f) => MIME_TYPES[extname(f).toLowerCase()]);

  if (!images.length) {
    console.log('No images found in public/images/places/');
    process.exit(0);
  }

  console.log(`Found ${images.length} image(s) in ${SOURCE_DIR}\n`);

  for (const file of images) {
    const ext = extname(file).toLowerCase();
    const contentType = MIME_TYPES[ext];
    const key = `places/${file}`;
    const filePath = join(SOURCE_DIR, file);
    try {
      await upload(filePath, key, contentType);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }

  console.log('\nDone.');
}

main();
