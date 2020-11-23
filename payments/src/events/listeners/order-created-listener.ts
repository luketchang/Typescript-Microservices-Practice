import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, QueueGroupName, Subject } from '@lt-ticketing/common';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subject.OrderCreated = Subject.OrderCreated;
    queueGroupName = QueueGroupName.PaymentsService;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            userId: data.userId,
            status: data.status,
            version: data.version
        });
        await order.save();

        msg.ack();
    }
}