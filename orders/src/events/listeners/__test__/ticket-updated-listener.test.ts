import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { TicketUpdatedEvent } from '@lt-ticketing/common';
import { TicketUpdatedListener } from '../../../events/listeners/ticket-updated-listener';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { createTicket } from '../../../test/createTicket';

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = await createTicket();

    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: ticket.title,
        price: ticket.price + 10,
        userId: mongoose.Types.ObjectId().toHexString(),
        version: ticket.version + 1
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg };
}

it('creates a new ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);
    
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.price).not.toEqual(ticket.price);
    expect(updatedTicket!.version).toEqual(ticket.version + 1);
});

it('acks a message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('does not ack/process an event with a old version number', async () => {
    const { listener, ticket, data, msg } = await setup();

    //data version remains same so ack called once
    try {
        await listener.onMessage(data, msg);
    } catch(err) {}

    expect(msg.ack).toHaveBeenCalledTimes(1);
});

it('does not ack/process an event with a skipped version number', async () => {
    const { listener, data, msg } = await setup();

    data.version = 3;
    try {
        await listener.onMessage(data, msg);
    } catch(err) {}

    expect(msg.ack).not.toHaveBeenCalled();
});