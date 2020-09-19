import request from 'supertest';

import { app } from '../app';

export const createTicket = async (title: string, price: number, cookie: string[]) => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price
        })
        .expect(201);
};