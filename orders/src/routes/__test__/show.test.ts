import request from 'supertest';

import { app } from '../../app';
import { createTicket } from '../../test/createTicket';
import { createOrder } from '../../test/createOrder';
import { getAuthCookie } from '../../test/getAuthCookie';

it('fetches a particular order for a user', async () => {
    const cookie = getAuthCookie();
    const ticket = await createTicket();
    const { body: order } = await createOrder(ticket, cookie);

    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it('throws NotAuthorizedError if user does not own order', async () => {
    const userOneCookie = getAuthCookie();
    const userTwoCookie = getAuthCookie();
    const ticket = await createTicket();
    const { body: order } = await createOrder(ticket, userOneCookie);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userTwoCookie)
        .expect(401);
});