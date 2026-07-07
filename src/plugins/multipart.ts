import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';
import { UPLOAD } from '@/config/constants.js';

export default fp(async (app) => {
  await app.register(multipart, {
    limits: {
      fileSize: UPLOAD.MAX_FILE_SIZE,
      files: 10,
    },
  });
}, { name: 'multipart' });
