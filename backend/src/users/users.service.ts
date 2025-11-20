import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll(role?: string) {
    if (role) {
      return this.prisma.user.findMany({
        where: { role: role as UserRole },
      });
    }
    return this.prisma.user.findMany();
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
    });
  }

  async findDoctors() {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.DOCTOR,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        specialty: true,
        phone: true,
      },
    });
  }
}


