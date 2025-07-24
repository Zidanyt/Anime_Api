// src/controllers/auth.controller.ts
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { generateToken } from '../utils/generateToken'

const prisma = new PrismaClient()

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) return res.status(400).json({ message: 'Email já cadastrado' })

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword }
  })

  const token = generateToken(user.id)
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ message: 'Senha inválida' })

  const token = generateToken(user.id)
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token })
}

export const getProfile = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId }, // vindo do middleware
    select: { id: true, name: true, email: true }
  })

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })
  res.json(user)
}
