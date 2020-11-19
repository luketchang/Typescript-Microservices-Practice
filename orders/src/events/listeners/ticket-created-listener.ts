import { Message } from 'node-nats-streaming';
import { Subject, QueueGroupName, TicketCreatedEvent, Listener } from '@lt-ticketing/common';
import { Ticket } from '../../models/ticket';

class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subject.TicketCreated = Subject.TicketCreated;
    queueGroupName = QueueGroupName.OrdersService;

    onMessage(data: TicketCreatedEvent['data'], msg: Message) {

    }
}