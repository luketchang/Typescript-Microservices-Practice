import request from 'supertest';

import { app } from '../../app';
import { getAuthCookie } from '../../test/getAuthCookie';

it('has a route handler /api/tickets for post requests', async () => {
    const res = await request(app)
        .post('/api/tickets')
        .send({});
    
    expect(res.status).not.toEqual(404);
});

it('can only be accessed by a user who is signed in', async () => {
    const res = await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

it('does not return 401 if user is signed in', async () => {
    const cookie = getAuthCookie();

    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({});

    expect(res.status).not.toEqual(401);
});

it('throws an error if an invalid title is provided', async () => {
    const cookie = getAuthCookie();
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 100
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            price: 100
        })
        .expect(400);
});

it('throws an error if an invalid price is provided', async () => {
    const cookie = getAuthCookie();
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'title',
            price: -10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'title'
        })
        .expect(400);
});

it('creates a ticket if all inputs are valid', async () => {

});