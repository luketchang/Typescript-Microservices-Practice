import request from 'supertest';

import { app } from '../app';

export const getAuthCookie = async () => {
    const email = 'test@test.com';
    const password = 'password';

    const res = await request(app)
        .post('/api/users/sign-up')
        .send({
            email,
            password
        })
        .expect(201);

    return res.get('Set-Cookie');
};