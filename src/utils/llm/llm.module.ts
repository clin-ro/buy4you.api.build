import { LlmService } from '@/utils/llm/llm.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [LlmService],
    exports: [LlmService],
})
export class LlmModule { } 