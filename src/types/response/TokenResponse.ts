export class TokenResponse<T = any> {
    message: string;
    isValid: boolean;
    data: T | any;
    constructor(isValid: boolean, data?: T | any, message?: string) {
        this.data = data ?? null;
        this.isValid = isValid;
        this.data = data;
    }
}
export interface AuthUser {
    _id: string;
}