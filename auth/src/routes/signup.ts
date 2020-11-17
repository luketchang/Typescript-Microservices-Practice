import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@lt-ticketing/common';

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