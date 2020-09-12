import request from 'supertest';
import { app } from '../../app';

it('fails when email supplied does not exist', async () => {
    await request(app)
        .post('/api/users/sign-in')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(400);
});

it('fails when incorrect password is supplied', async () => {
    await request(app)
        .post('/api/users/sign-up')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
    
    await request(app)
        .post('/api/users/sign-in')
        .send({
            email: 'test@test.com',
            password: 'incorrect_password'
        })
        .expect(400);
});

it('sends back cookie if credentials are valid', async () => {
    const res = await request(app)
        .post('/api/users/sign-up')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
    
    await request(app)
        .post('/api/users/sign-in')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(200);

        expect(res.get('Set-Cookie')).toBeDefined();
});