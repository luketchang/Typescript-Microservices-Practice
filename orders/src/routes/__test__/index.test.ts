import request from 'supertest';

import { app } from '../../app';
import { createTicket } from '../../test/createTicket';
import { createOrder } from '../../test/createOrder';
import { getAuthCookie } from '../../test/getAuthCookie';

it('fetches an order for a particular user', async () => {
    const userOneCookie = getAuthCookie();
    const userTwoCookie = getAuthCookie();

    const ticketOne = await createTicket();
    const ticketTwo = await createTicket();
    const ticketThree = await createTicket();

    const { body: orderOne } = await createOrder(ticketOne, userOneCookie);
    const { body: orderTwo } = await createOrder(ticketTwo, userTwoCookie);
    const { body: orderThree } = await createOrder(ticketThree, userTwoCookie);

    const res = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwoCookie)
        .expect(200);

    expect(res.body.length).toEqual(2);
    expect(res.body[0].id).toEqual(orderTwo.id);
    expect(res.body[1].id).toEqual(orderThree.id);
    expect(res.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(res.body[1].ticket.id).toEqual(ticketThree.id);
});