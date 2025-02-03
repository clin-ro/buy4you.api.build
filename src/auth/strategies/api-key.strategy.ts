import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key') {
    constructor(private authService: AuthService) {
        super(
            { header: 'api-key', prefix: '' },
            false
        );
    }

    async validate(apiKey: string): Promise<any> {
        return this.authService.validateApiKey(apiKey);
    }
} 