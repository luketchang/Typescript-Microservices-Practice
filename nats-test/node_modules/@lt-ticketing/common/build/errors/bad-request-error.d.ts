import { CustomError } from './custom-error';
export declare class BadRequestError extends CustomError {
    message: string;
    constructor(message: string);
    statusCode: number;
    serializeErrors(): {
        message: string;
    }[];
}
