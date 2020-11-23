import { Message } from 'node-nats-streaming';
import { Subject, QueueGroupName, TicketCreatedEvent, Listener } from '@lt-ticketing/common';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subject.TicketCreated = Subject.TicketCreated;
    queueGroupName = QueueGroupName.OrdersService;

    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const { id, title, price } = data;
        const ticket = Ticket.build({ id, title, price });
        await ticket.save();

        msg.ack();
    }
}