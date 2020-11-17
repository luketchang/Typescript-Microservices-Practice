import { CustomError } from './custom-error';
export declare class NotFoundError extends CustomError {
    constructor();
    statusCode: number;
    serializeErrors(): {
        message: string;
    }[];
}
