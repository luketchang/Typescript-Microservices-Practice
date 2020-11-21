import request from 'supertest';

import { app } from '../../app';
import { getAuthCookie } from '../../test/getAuthCookie';

it('responds with current user details if authenticated', async () => {
    const cookie = await getAuthCookie();

    const res = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(200);

    expect(res.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null current user if not authenticated', async () => {
    const res = await request(app)
        .get('/api/users/currentuser')
        .send({})
        .expect(200);

    expect(res.body.currentUser).toEqual(null);
});