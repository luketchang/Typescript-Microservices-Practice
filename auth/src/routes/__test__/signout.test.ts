import request from 'supertest';
import { app } from '../../app';

it('clears cookie after signing out', async () => {
    await request(app)
        .post('/api/users/sign-up')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
    
    const res = await request(app)
        .post('/api/users/sign-out')
        .send({})
        .expect(200);
    
    expect(res.get('Set-Cookie')[0]).toEqual(
        'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
    );
});