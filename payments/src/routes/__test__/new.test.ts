import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order } from '../../models/order';
import { getAuthCookie } from '../../test/getAuthCookie';
import { OrderStatus } from '@lt-ticketing/common';

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