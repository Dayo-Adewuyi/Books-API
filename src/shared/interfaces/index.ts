export interface JwtSignature {
    issuer: string;
    subject: string;
    audience: string;
}

export interface SignedData {
    id: string;
    username: string;
}