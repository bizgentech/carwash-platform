import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '@prisma/client'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (user: Partial<User>): string => {
  const payload: JWTPayload = {
    userId: user.id!,
    email: user.email!,
    role: user.role!,
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
  })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    console.log('[verifyToken] Attempting to verify token')
    console.log('[verifyToken] JWT_SECRET exists:', !!JWT_SECRET)
    console.log('[verifyToken] Token length:', token?.length)
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    console.log('[verifyToken] Token verified successfully:', decoded)
    return decoded
  } catch (error) {
    console.error('[verifyToken] Error verifying token:', error)
    if (error instanceof Error) {
      console.error('[verifyToken] Error message:', error.message)
    }
    return null
  }
}

// Edge-compatible JWT functions using jose
export async function generateTokenEdge(user: Partial<User>): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id!,
    email: user.email!,
    role: user.role!,
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET_KEY)

  return token
}

export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    console.log('[verifyTokenEdge] Attempting to verify token')
    console.log('[verifyTokenEdge] Token length:', token?.length)

    const { payload } = await jwtVerify(token, JWT_SECRET_KEY)

    console.log('[verifyTokenEdge] Token verified successfully:', payload)

    return payload as JWTPayload
  } catch (error) {
    console.error('[verifyTokenEdge] Error verifying token:', error)
    if (error instanceof Error) {
      console.error('[verifyTokenEdge] Error message:', error.message)
    }
    return null
  }
}

export const generateResetToken = (): string => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}
