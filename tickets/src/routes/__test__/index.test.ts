import request from 'supertest';

import { app } from '../../app';
import { getAuthCookie } from '../../test/getAuthCookie';
import { createTicket } from '../../test/createTicket';

it('fetches list of all tickets', async () => {
    const cookie = getAuthCookie();
    
    createTicket('ticket1', 100, cookie);
    createTicket('ticket2', 50, cookie);
    createTicket('ticket3', 25, cookie); 

    const res = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    console.log(res.body)

    expect(res.body.length).toEqual(3);
});