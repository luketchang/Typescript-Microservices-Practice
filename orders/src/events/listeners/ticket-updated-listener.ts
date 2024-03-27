import { Message } from 'node-nats-streaming';
import { Subject, QueueGroupName, TicketUpdatedEvent, Listener } from '@lt-ticketing/common';
import { Ticket } from '../../models/ticket';
import { logger } from '../../logger'; // import the logger

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subject.TicketUpdated = Subject.TicketUpdated;
    queueGroupName = QueueGroupName.OrdersService;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        logger.info('Ticket updated event received', { ticketId: data.id });
        const ticket = await Ticket.findByEvent(data);
        if(!ticket) {
            logger.warn('Ticket not found', { ticketId: data.id });
            throw new Error('Ticket not found.')
        }

        const { title, price } = data;
        ticket.set({ title, price });
        await ticket.save();

        logger.info('Ticket updated', { ticketId: ticket.id, title: ticket.title, price: ticket.price });

        msg.ack();
    }
}