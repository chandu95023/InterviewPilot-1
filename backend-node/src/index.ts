import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

fastify.register(cors, { origin: true });
fastify.register(jwt, { secret: process.env.JWT_SECRET || 'supersecret' });

// Authentication decorator for protected routes
fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Decorate fastify instance with Prisma for handlers
fastify.decorate('prisma', prisma);

fastify.register(authRoutes, { prefix: '/api/auth' });

const start = async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT) || 8000, host: '0.0.0.0' });
    fastify.log.info(`Server listening at http://0.0.0.0:${process.env.PORT || 8000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
