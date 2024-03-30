import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@lt-ticketing/common';
import { logger } from '../logger'; 

const router = express.Router();

router.post(
    '/api/users/signup', 
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
        
        logger.info('Received sign up request', { email });

        const userExists = await User.findOne({ email });
        if(userExists) {
            logger.warn('Email already in use', { email });
            throw new BadRequestError('Email already in use.')
        }

        const newUser = User.build({ email, password });
        await newUser.save();

        logger.info('User created', { email, userId: newUser.id });
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

        logger.info('User signed up', { email, userId: newUser.id });
        res.status(201).send(newUser);
    }
);

export { router as signupRouter };