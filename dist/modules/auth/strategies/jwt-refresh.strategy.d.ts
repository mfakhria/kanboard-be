import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './jwt.strategy';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
    }>;
}
export {};
