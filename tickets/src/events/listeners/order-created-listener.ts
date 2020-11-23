import { Message } from 'node-nats-streaming';
import { Listener, NotFoundError, OrderCreatedEvent, QueueGroupName, Subject } from '@lt-ticketing/common';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subject.OrderCreated = Subject.OrderCreated;
    queueGroupName = QueueGroupName.TicketsService;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket) throw new Error('Ticket not found.');

        ticket.set({ orderId: data.id });
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        })
        
        msg.ack();
    }
}