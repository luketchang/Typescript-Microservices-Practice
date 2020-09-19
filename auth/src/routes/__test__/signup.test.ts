import request from 'supertest';
import { app } from '../../app';

it('returns 201 on successful signup', async () => {
    await request(app)
        .post('/api/users/sign-up')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
});

it('sends back jwt in cookie on successful signup', async () => {
    const res = await request(app)
        .post('/api/users/sign-up')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
    
    expect(res.get('Set-Cookie')).toBeDefined();
});

it('returns 400 with invalid email', async () => {
    await request(app)
        .post('/api/users/sign-up')
        .send({
            email: 'emailwithno@',
            password: 'password'
        })
        .expect(400);
});

it('returns 400 with invalid password', async () => {
    await request(app)
        .post('/api/users/sign-up')
        .send({
            email: 'test@test.com',
            password: 'p'
        })
        .expect(400);
});

it('returns 400 with missing email or password', async () => {
    await request(app)
        .post('/api/users/sign-up')
        .send({
            email: 'test@test.com',
            password: ''
        })
        .expect(400);

    await request(app)
        .post('/api/users/sign-up')
        .send({
            email: '',
            password: 'password'
        })
        .expect(400);  
});

it('disallows duplicate email usage', async () => {
    await request(app)
        .post('/api/users/sign-up')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);

    await request(app)
        .post('/api/users/sign-up')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(400);
});