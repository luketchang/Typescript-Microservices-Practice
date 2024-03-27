import { Message } from 'node-nats-streaming';
import { Subject, QueueGroupName, ExpirationCompleteEvent, Listener, OrderStatus } from '@lt-ticketing/common';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { Order } from '../../models/order';
import { logger } from '../../logger'; 

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subject.ExpirationComplete = Subject.ExpirationComplete;
    queueGroupName = QueueGroupName.OrdersService;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        logger.info('Expiration complete event received', { orderId: data.orderId });
        const order  = await Order.findById(data.orderId).populate('ticket');

        if(!order) {
            logger.warn('Order not found', { orderId: data.orderId });
            throw new Error('Order not found.');
        }

        if(order.status === OrderStatus.Complete) {
            logger.info('Order already completed', { orderId: order.id });
            return msg.ack();
        }

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        logger.info('Order cancelled', { orderId: order.id });

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        logger.info('Order cancellation published', { orderId: order.id });

        msg.ack();
    }
}