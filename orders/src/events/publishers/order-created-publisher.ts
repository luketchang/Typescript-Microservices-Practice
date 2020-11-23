import { Subject, Publisher, OrderCreatedEvent } from '@lt-ticketing/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subject.OrderCreated = Subject.OrderCreated;
}