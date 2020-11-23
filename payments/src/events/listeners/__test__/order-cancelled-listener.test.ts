import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCancelledEvent, OrderStatus } from '@lt-ticketing/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 20,
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: mongoose.Types.ObjectId().toHexString()
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, data, msg };
}

it('updates status of order to cancelled', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(data.id);
    
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});