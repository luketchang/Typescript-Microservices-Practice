import request from 'supertest';

import { app } from '../../app';
import { getAuthCookie } from '../../test/getAuthCookie';
import { createTicket } from '../../test/createTicket';

it('fetches list of all tickets', async () => {
    const cookie = getAuthCookie();
    
    await createTicket('ticket1', 100, cookie);
    await createTicket('ticket2', 50, cookie);
    await createTicket('ticket3', 25, cookie); 

    const res = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(res.body.length).toEqual(3);
});