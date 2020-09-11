import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import { validateRequest } from '../middlewares/validate-request';
import { RequestValidationError } from '../errors/request-validation-error';

const router = express.Router();

router.post('/api/users/sign-in', 
    [
        body('email')
            .isEmail()
            .withMessage('Please enter valid email.'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Must supply a password')
    ],
    validateRequest,
    (req: Request, res: Response) => {

    }
);

export { router as signinRouter };