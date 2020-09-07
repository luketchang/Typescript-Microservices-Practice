import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

const router = express.Router();

router.post('/api/users/sign-up', [
    body('email')
        .isEmail()
        .withMessage('Please enter valid email.'),
    body('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters.')
    ], 
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            throw new RequestValidationError(errors.array());
        }

        const { email, password } = req.body;
        throw new DatabaseConnectionError();

        console.log('Creating user...');

        res.send({});
    }
);

export { router as signupRouter };