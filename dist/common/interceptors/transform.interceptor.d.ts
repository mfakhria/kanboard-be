import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ResponseShape<T> {
    statusCode: number;
    message: string;
    data: T;
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, ResponseShape<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseShape<T>>;
}
