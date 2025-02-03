import { ApiProperty } from '@nestjs/swagger';

export class ExtractContactResponseDto {
    @ApiProperty({
        description: 'Contact name',
        example: 'John Doe'
    })
    name: string;

    @ApiProperty({
        description: 'Contact email',
        example: 'john.doe@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'Contact phone number',
        example: '+1 (555) 123-4567'
    })
    phone: string;

    @ApiProperty({
        description: 'Contact title/position',
        example: 'Sales Manager',
        required: false
    })
    title?: string;

    @ApiProperty({
        description: 'Contact department',
        example: 'Sales',
        required: false
    })
    department?: string;
} 