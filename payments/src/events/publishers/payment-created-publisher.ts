import { Subject, Publisher, PaymentCreatedEvent } from '@lt-ticketing/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subject.PaymentCreated = Subject.PaymentCreated;
}