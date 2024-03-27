import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, QueueGroupName, Subject } from '@lt-ticketing/common';
import { expirationQueue } from '../../queues/expiration-queue';
import { logger } from '../../logger';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subject.OrderCreated = Subject.OrderCreated;
    queueGroupName = QueueGroupName.ExpirationService;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        logger.info("Order created event received", { orderId: data.id });
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

        logger.info("Order expires in milliseconds.", { delay, orderId: data.id });
        await expirationQueue.add(
            {
                orderId: data.id
            },
            {
                delay
            }
        );

        logger.info("Order added to expiration queue", { orderId: data.id });

        msg.ack();
        
        logger.info("Order created event acknowledged", { orderId: data.id });
    }
}