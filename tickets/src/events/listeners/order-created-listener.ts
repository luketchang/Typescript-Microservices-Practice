import { Message } from 'node-nats-streaming';
import { Listener, NotFoundError, OrderCreatedEvent, QueueGroupName, Subject } from '@lt-ticketing/common';
import { Ticket } from '../../models/ticket';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subject.OrderCreated = Subject.OrderCreated;
    queueGroupName = QueueGroupName.TicketsService;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket) throw new Error('Ticket not found.');

        ticket.set({ orderId: data.id });
        await ticket.save();

        //emit ticket updated event
        
        msg.ack();
    }
}