import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export default async function (fastify: FastifyInstance, opts: any) {
  const prisma: PrismaClient = fastify.prisma;

  // Register schema
  const registerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  });

  fastify.post('/register', async (request, reply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ detail: 'Invalid input' });
    }
    const { name, email, password } = parseResult.data;
    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(400).send({ detail: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, email, passwordHash: hashed },
    });
    return reply.send({ id: user.id, name: user.name, email: user.email });
  });

  // Login schema
  const loginSchema = z.object({
    username: z.string().email(),
    password: z.string(),
  });

  fastify.post('/login', async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ detail: 'Invalid input' });
    }
    const { username, password } = parseResult.data;
    const user = await prisma.user.findUnique({ where: { email: username } });
    if (!user) {
      return reply.status(401).send({ detail: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ detail: 'Invalid credentials' });
    }
    const token = jwt.sign({ sub: user.email }, process.env.JWT_SECRET || 'supersecret', {
      expiresIn: `${process.env.JWT_EXPIRATION_MINUTES || 120}m`,
    });
    return reply.send({ access_token: token, token_type: 'bearer' });
  });

  // Protected profile
  fastify.get('/profile', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const email = (request.user as any).sub;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(404).send({ detail: 'User not found' });
    }
    return reply.send({ id: user.id, name: user.name, email: user.email });
  });
}
