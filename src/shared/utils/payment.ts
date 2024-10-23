import axios, { AxiosResponse } from 'axios';
import Env from './env';
import { InternalServerErrorException } from '../errors';

export interface InitializationResponse {
    authorization_url: string;
    access_code: string;
    reference: string;
}

interface VerificationResponse {
    status: boolean;
    data: {
        status: string;
        reference: string;
        amount: number;
        customer: {
            email: string;
        };
        metadata: {
            username: string;
        };
    };
}

export interface PaymentService {
    initialize(
        userId: string,
        amount: string
    ): Promise<InitializationResponse>;

    verifyPayment(reference: string): Promise<string>
}

class PaymentServiceImpl implements PaymentService {
    private readonly url: string;
    private readonly secretKey: string;
    private readonly axiosConfig: { headers: { Authorization: string } };

    constructor() {
        this.url = Env.get<string>('PAYSTACK_URL');
        this.secretKey = Env.get<string>('PAYSTACK_KEY');
        this.axiosConfig = {
            headers: { Authorization: `Bearer ${this.secretKey}` }
        };
    }

    /**
     * Initialize a PayStack payment transaction
     * @param username - Username for metadata
     * @param amount - Amount in kobo (smallest currency unit)
     * @returns Promise with PayStack initialization response
     */
    public async initialize(
        userId: string,
        amount: string
    ): Promise<InitializationResponse> {
        if (Env.get<string>('NODE_ENV') === 'test'){
            return {
                authorization_url: "https://test.authorization.url",
                access_code: "test-access-code",
                reference: "test-reference"
            }
        } 
        const response: AxiosResponse = await axios.post(
            `${this.url}transaction/initialize`,
            {
                email: "test@enyata.com",
                amount,
                metadata: { userId }
            },
            this.axiosConfig
        );

        if (!response) {
            throw new InternalServerErrorException("payment provider error")
        }

        return response.data.data;

    }

    /**
     * Verify a PayStack payment transaction
     * @param reference - Transaction reference to verify
     * @returns Promise with payment status
     */
    public async verifyPayment(reference: string): Promise<string> {
        const response: AxiosResponse<VerificationResponse> = await axios.get(
            `${this.url}/transaction/verify/${reference}`,
            this.axiosConfig
        );


        if (!response) {
            throw new InternalServerErrorException("payment provider error")
        }
        return response.data.data.status;

    }
}

export const paymentService = new PaymentServiceImpl();

export default paymentService;