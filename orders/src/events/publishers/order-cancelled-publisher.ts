import { Subject, Publisher, OrderCancelledEvent } from '@lt-ticketing/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subject.OrderCancelled = Subject.OrderCancelled;
}