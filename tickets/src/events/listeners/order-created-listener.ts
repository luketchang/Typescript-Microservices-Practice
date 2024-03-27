import { Message } from 'node-nats-streaming';
import { Listener, NotFoundError, OrderCreatedEvent, QueueGroupName, Subject } from '@lt-ticketing/common';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { logger } from '../../logger';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subject.OrderCreated = Subject.OrderCreated;
    queueGroupName = QueueGroupName.TicketsService;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        logger.info('Order created event received', { orderId: data.id });

        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket) {
            logger.warn('Ticket not found', { ticketId: data.ticket.id });
            throw new Error('Ticket not found.');
        }

        ticket.set({ orderId: data.id });
        await ticket.save();

        logger.info('Ticket updated', { ticketId: ticket.id, title: ticket.title, price: ticket.price, userId: ticket.userId, version: ticket.version, orderId: ticket.orderId });

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });

        logger.info('Ticket updated event published', { ticketId: ticket.id });

        msg.ack();

        logger.info('Order created event acknowledged', { orderId: data.id });
    }
}