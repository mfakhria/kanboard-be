import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
        };
    }>;
    refresh(user: {
        id: string;
        email: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    }>;
    getProfile(userId: string): Promise<{
        name: string;
        email: string;
        id: string;
        avatar: string | null;
        createdAt: Date;
    }>;
}
