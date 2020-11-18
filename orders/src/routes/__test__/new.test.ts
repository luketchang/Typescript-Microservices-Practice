import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { getAuthCookie } from '../../test/getAuthCookie';
import { OrderStatus } from '@lt-ticketing/common';

it('returns NotFoundError if ticket does not exist', async () => {
    const cookie = getAuthCookie();
    const ticketId = mongoose.Types.ObjectId();

    const res =  await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId })
        .expect(404);
});

it('returns BadRequestError if ticket is already reserved', async () => {
    const cookie = getAuthCookie();

    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const order = Order.build({
        userId: 'user_id',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket
    });
    await order.save();

    const res = request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('returns order object on success', async () => {
    const cookie = getAuthCookie();

    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const res = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);
});

it.todo('publishes an OrderCreated event');