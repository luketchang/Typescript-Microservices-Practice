import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCreatedEvent, OrderStatus } from '@lt-ticketing/common';
import { OrderCreatedListener } from '../../../events/listeners/order-created-listener';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'expiretime',
        version: 0,
        ticket: {
            id: mongoose.Types.ObjectId().toHexString(),
            price: 20
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
}

it('creates a new order', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);
    const order = await Order.findById(data.id);
    
    expect(order).toBeDefined();
    expect(order!.price).toEqual(data.ticket.price);
});

it('acks a message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});