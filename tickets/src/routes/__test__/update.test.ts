import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { getAuthCookie } from '../../test/getAuthCookie';
import { createTicket } from '../../test/createTicket';

it('returns 404 if provided ticket id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const cookie = getAuthCookie();

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: 'title',
            price: 100
        })
        .expect(404);
});

it('returns 401 if user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'title',
            price: 100
        })
        .expect(401);
});

it('returns 401 if user does not own ticket', async () => {
    const cookie = getAuthCookie();
    const title = 'title';
    const price = 100;

    const res = await createTicket(title, price, cookie);

    const differentCookie = getAuthCookie();
    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', differentCookie)
        .send({
            title: 'new title',
            price: 150
        })
        .expect(401);
});

it('returns 404 if provided ticket id does not exist', async () => {
    
});

it('returns 400 if user provides invalid title or price', async () => {
    
});

it('updates the ticket if all inputs valid', async () => {
    
});