import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        name: string;
        email: string;
        id: string;
        avatar: string | null;
        createdAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        name: string;
        email: string;
        id: string;
        avatar: string | null;
        createdAt: Date;
    } | null>;
    updateProfile(userId: string, data: {
        name?: string;
        avatar?: string;
    }): Promise<{
        name: string;
        email: string;
        id: string;
        avatar: string | null;
        createdAt: Date;
    }>;
}
