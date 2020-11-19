import request from 'supertest';

import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@lt-ticketing/common';
import { createTicket } from '../../test/createTicket';
import { createOrder } from '../../test/createOrder';
import { getAuthCookie } from '../../test/getAuthCookie';
import { natsWrapper } from '../../nats-wrapper';

jest.mock('../../nats-wrapper');

it('updates an order status to cancelled', async () => {
    const cookie = getAuthCookie();
    const ticket = await createTicket();
    const { body: order } = await createOrder(ticket, cookie);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(204);

    const cancelledOrder = await Order.findById(order.id);
    expect(cancelledOrder!.id).toEqual(order.id);
    expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('throws NotAuthorizedError if user does not own order', async () => {
    const userOneCookie = getAuthCookie();
    const userTwoCookie = getAuthCookie();
    const ticket = await createTicket();
    const { body: order } = await createOrder(ticket, userOneCookie);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', userTwoCookie)
        .expect(401);
});

it('publishes an OrderCancelled event', async () => {
    const cookie = getAuthCookie();
    const ticket = await createTicket();
    const { body: order } = await createOrder(ticket, cookie);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toBeCalledTimes(2);
});