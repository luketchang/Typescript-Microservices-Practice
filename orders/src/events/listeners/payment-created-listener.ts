import { Subject, Listener, PaymentCreatedEvent, QueueGroupName, OrderStatus } from '@lt-ticketing/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { logger } from '../../logger'; 

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subject.PaymentCreated = Subject.PaymentCreated;
    queueGroupName = QueueGroupName.OrdersService;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        logger.info('Payment created event received', { orderId: data.orderId });
        const order = await Order.findById(data.orderId);

        if(!order) {
            logger.warn('Order not found', { orderId: data.orderId });
            throw new Error('Order not found.')
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        logger.info('Order completed', { orderId: order.id });

        //TODO: add OrderUpdatedEvent to tell other services to update orders

        msg.ack();
    }
}