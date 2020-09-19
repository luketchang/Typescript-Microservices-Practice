import request from 'supertest';

import { app } from '../../app';
import { getAuthCookie } from '../../test/getAuthCookie';
import { Ticket } from '../../models/ticket';
import { createTicketRouter } from '../new';

it('returns 404 if ticket is not found', async () => {
    await request(app)
        .get('/api/tickets/NO_TICKET_EXISTS')
        .send()
        .expect(404);
});

it('returns ticket if ticket is found', async () => {
    const cookie = getAuthCookie();

    const createTicketRes = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'title',
            price: 100
        })
        .expect(201);
    
    const { id, title, price } = createTicketRes.body;

    const getTicketRes = await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(200);

    expect(getTicketRes.body.id).toEqual(id);
    expect(getTicketRes.body.title).toEqual(title);
    expect(getTicketRes.body.price).toEqual(price);
});