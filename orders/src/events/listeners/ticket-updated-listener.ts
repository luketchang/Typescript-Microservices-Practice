import { Message } from 'node-nats-streaming';
import { Subject, QueueGroupName, TicketUpdatedEvent, Listener } from '@lt-ticketing/common';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subject.TicketUpdated = Subject.TicketUpdated;
    queueGroupName = QueueGroupName.OrdersService;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const { id, title, price } = data;
        const ticket = await Ticket.findById(id);
        if(!ticket) throw new Error('Ticket not found.')

        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    }
}