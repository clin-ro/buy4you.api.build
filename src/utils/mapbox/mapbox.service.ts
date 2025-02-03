import { Address } from '@/schemas/mongo/common.schema';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface AddressFeature {
    id: string;
    type: string;
    place_type: string[];
    place_name: string;
    text: string;
    center: [number, number];
    context: Array<{
        id: string;
        text: string;
    }>;
    metadata?: Record<string, any>;
}

export interface AddressDetails extends Omit<Address, 'coordinates'> {
    coordinates: [number, number];
}

@Injectable()
export class MapboxService {
    private readonly logger = new Logger(MapboxService.name);
    private readonly accessToken: string;
    private readonly baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

    constructor(private readonly configService: ConfigService) {
        const token = this.configService.get<string>('MAPBOX_ACCESS_TOKEN');
        if (!token) {
            throw new Error('MAPBOX_ACCESS_TOKEN is not defined');
        }
        this.accessToken = token;
    }

    async searchAddresses(query: string, limit = 5): Promise<AddressFeature[]> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/${encodeURIComponent(query)}.json`,
                {
                    params: {
                        access_token: this.accessToken,
                        types: 'address',
                        limit,
                    },
                },
            );
            return response.data.features;
        } catch (error) {
            this.logger.error('Error searching addresses:', error);
            throw new Error('Failed to fetch address predictions');
        }
    }

    async reverseGeocode(longitude: number, latitude: number): Promise<AddressFeature | null> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/${longitude},${latitude}.json`,
                {
                    params: {
                        access_token: this.accessToken,
                        types: 'address',
                    },
                },
            );

            if (response.data.features.length > 0) {
                return response.data.features[0];
            }
            return null;
        } catch (error) {
            this.logger.error('Error reverse geocoding:', error);
            throw new Error('Failed to reverse geocode coordinates');
        }
    }

    parseAddressDetails(feature: AddressFeature): AddressDetails {
        return {
            streetAddress: feature.place_name.split(',')[0],
            city: feature.context.find(item => item.id.startsWith('place'))?.text || '',
            region: feature.context.find(item => item.id.startsWith('region'))?.text || '',
            postalCode: feature.context.find(item => item.id.startsWith('postcode'))?.text || '',
            country: feature.context.find(item => item.id.startsWith('country'))?.text || '',
            coordinates: feature.center,
            placeId: feature.id,
            metadata: feature.metadata
        };
    }

    convertToMongooseAddress(addressDetails: AddressDetails): Address {
        const [longitude, latitude] = addressDetails.coordinates;
        return {
            ...addressDetails,
            coordinates: {
                longitude,
                latitude
            }
        };
    }
} 