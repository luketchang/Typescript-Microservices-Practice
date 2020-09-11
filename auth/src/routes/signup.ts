import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';

import { validateRequest } from '../middlewares/validate-request';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

router.post('/api/users/sign-up', 
    [
        body('email')
            .isEmail()
            .withMessage('Please enter valid email.'),
        body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters.')
    ], 
    validateRequest,
    async (req: Request, res: Response) => {

        const { email, password } = req.body;

        const userExists = await User.findOne({ email });
        if(userExists) {
            throw new BadRequestError('Email already in use.')
        }

        const newUser = User.build({ email, password });
        await newUser.save();

        const userJwt = jwt.sign(
            {
            id: newUser.id,
            email: newUser.email
            }, 
            process.env.JWT_KEY!
        );

        req.session = {
            jwt: userJwt
        };

        res.status(201).send(newUser);
    }
);

export { router as signupRouter };