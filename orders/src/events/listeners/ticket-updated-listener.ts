import { Message } from 'node-nats-streaming';
import { Subject, QueueGroupName, TicketUpdatedEvent, Listener } from '@lt-ticketing/common';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subject.TicketUpdated = Subject.TicketUpdated;
    queueGroupName = QueueGroupName.OrdersService;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data);
        if(!ticket) throw new Error('Ticket not found.')

        const { title, price } = data;
        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    }
}