import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username dan password wajib diisi.',
      }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { username: username.trim() },
    });

    if (!admin || admin.passwordHash !== hashPassword(password)) {
      return NextResponse.json({
        success: false,
        message: 'Username atau password salah.',
      }, { status: 401 });
    }

    const token = createToken({ id: admin.id, username: admin.username });

    const res = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      admin: { id: admin.id, username: admin.username, name: admin.name },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 1 day
    });

    return res;
  } catch (err: any) {
    console.error('API /api/admin/login error:', err);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat proses login.',
    }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logout berhasil.' });
  res.cookies.delete(COOKIE_NAME);
  return res;
}

