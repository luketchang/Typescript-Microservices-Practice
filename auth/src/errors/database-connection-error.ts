import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
    constructor() {
        super('Database Connection Error');
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
    }

    statusCode = 500;
    reason = 'Error connecting to database.';
    serializeErrors() {
        return [
            { message: this.reason }
        ];
    }
}