import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, QueueGroupName, Subject } from '@lt-ticketing/common';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subject.OrderCreated = Subject.OrderCreated;
    queueGroupName = QueueGroupName.ExpirationService;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log("Order expires in", delay, "milliseconds.");

        await expirationQueue.add(
            {
                orderId: data.id
            },
            {
                delay
            }
        );

        msg.ack();
    }
}