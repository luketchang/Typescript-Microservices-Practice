import { natsWrapper } from '../../../nats-wrapper';
import mongoose, { mongo } from 'mongoose';

import { Ticket } from '../../../models/ticket';
import { OrderCancelledEvent, OrderStatus } from '@lt-ticketing/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { updateTicketRouter } from '../../../routes/update';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: mongoose.Types.ObjectId().toHexString()
    });
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg };
}

it('updates the ticket order id property', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a TicketUpdatedEvent to update version #s', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const updatedTicketData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(updatedTicketData.orderId).toEqual(undefined);
});