import { CustomError } from './custom-error';
export declare class NotAuthorizedError extends CustomError {
    constructor();
    statusCode: number;
    serializeErrors(): {
        message: string;
    }[];
}
