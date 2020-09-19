import jwt from 'jsonwebtoken';

import { app } from '../app';

export const getAuthCookie = () => {
    const email = 'test@test.com';
    const password = 'password';
    const payload = {
        email,
        password
    };

    const token = jwt.sign(payload, process.env.JWT_KEY!);
    const session = { jwt: token };
    const sessionJson = JSON.stringify(session);
    const base64 = Buffer.from(sessionJson).toString('base64');
    return [`express:sess=${base64}`];
};