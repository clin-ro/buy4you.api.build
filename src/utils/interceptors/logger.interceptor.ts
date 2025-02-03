import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;

        console.log(`Incoming request: ${method} ${url}`);

        return next
            .handle()
            .pipe(
                tap(() => {
                    console.log(`Outgoing response: ${method} ${url} - ${Date.now() - now}ms`);
                }),
            );
    }
}
