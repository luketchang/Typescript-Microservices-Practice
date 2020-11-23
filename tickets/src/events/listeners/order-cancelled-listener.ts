import { Message } from 'node-nats-streaming';
import { Listener, NotFoundError, OrderCancelledEvent, QueueGroupName, Subject } from '@lt-ticketing/common';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subject.OrderCancelled = Subject.OrderCancelled;
    queueGroupName = QueueGroupName.TicketsService;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket) throw new Error('Ticket does not exist.');

        ticket.set({ orderId: undefined });
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });

        msg.ack();
    }
}