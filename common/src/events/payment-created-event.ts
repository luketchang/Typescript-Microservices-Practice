import { Subject } from './subject';
import { Event } from './base-event';

export interface PaymentCreatedEvent extends Event {
    subject: Subject.PaymentCreated;
    data: {
        id: string;
        orderId: string;
        stripeId: string;
    };
}