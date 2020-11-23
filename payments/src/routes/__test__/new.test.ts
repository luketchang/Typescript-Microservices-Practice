import request from 'supertest';
import mongoose from 'mongoose';
import { stripe } from '../../stripe';
import { app } from '../../app';
import { Order } from '../../models/order';
import { getAuthCookie } from '../../test/getAuthCookie';
import { OrderStatus } from '@lt-ticketing/common';
import { Payment } from '../../models/payment';

jest.mock('../../stripe');

it('returns a 404 (NotFoundError) when order does not exist', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const cookie = getAuthCookie(userId);

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: 'token',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
}); 

it('returns 401 (NotAuthorizedError) when purchasing order not belonging to user', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 20,
        userId: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0
    });
    await order.save();

    const userId = mongoose.Types.ObjectId().toHexString();
    const cookie = getAuthCookie(userId);

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: 'token',
            orderId: order.id
        })
        .expect(401);
});

it('returns 400 (BadRequestError) when purchasing cancelled order', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 20,
        userId,
        status: OrderStatus.Cancelled,
        version: 0
    });
    await order.save();

    
    const cookie = getAuthCookie(userId);
    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: 'token',
            orderId: order.id
        }) 
        .expect(400);
});

it('returns a 201 (created) with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 20,
        userId,
        status: OrderStatus.Created,
        version: 0
    });
    await order.save();

    const cookie = getAuthCookie(userId);
    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            orderId: order.id,
            token: 'tok_visa'
        })
        .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(20 * 100);
    expect(chargeOptions.currency).toEqual('usd');

    const payment = await Payment.findOne({ orderId: order.id });
    expect(payment).toBeDefined();
});