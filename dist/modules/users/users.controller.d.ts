import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(userId: string): Promise<{
        name: string;
        email: string;
        id: string;
        avatar: string | null;
        createdAt: Date;
    }>;
    updateMe(userId: string, data: {
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
