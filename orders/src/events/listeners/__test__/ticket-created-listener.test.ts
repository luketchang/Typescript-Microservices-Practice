import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { TicketCreatedEvent } from '@lt-ticketing/common';
import { TicketCreatedListener } from '../../../events/listeners/ticket-created-listener';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';

const setup = () => {
    const listener = new TicketCreatedListener(natsWrapper.client);

    const data: TicketCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
}

it('creates a new ticket', async () => {
    const { listener, data, msg } = setup();

    await listener.onMessage(data, msg);
    const ticket = await Ticket.findById(data.id);
    
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acks a message', async () => {
    const { listener, data, msg } = setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});