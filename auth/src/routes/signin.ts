import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@lt-ticketing/common';
import { User } from '../models/user'; 
import { Password } from '../utils/password';
import { logger } from '../logger';

const router = express.Router();

router.post(
    '/api/users/signin', 
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
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        logger.info('Received sign in request', { email });
        

        const existingUser = await User.findOne({ email });
        if(!existingUser) {
            logger.warn('User not found', { email });
            throw new BadRequestError('Invalid email.');
        }

        logger.info('User found', { email, userId: existingUser.id });
        const passwordsMatch = await Password.comparePasswords(existingUser.password, password);
        if(!passwordsMatch) {
            logger.warn('Invalid password', { email, userId: existingUser.id });
            throw new BadRequestError('Invalid password.')
        }

        logger.info('Password matches', { email, userId: existingUser.id });
        const userJwt = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email
            }, 
            process.env.JWT_KEY!
        );

        req.session = {
            email,
            jwt: userJwt
        };

        logger.info('User signed in', { email, userId: existingUser.id });
        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };