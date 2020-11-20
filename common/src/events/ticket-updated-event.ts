import { Subject } from './subject';
import { Event } from './base-event';

export interface TicketUpdatedEvent extends Event {
    subject: Subject.TicketUpdated;
    data: {
        id: string;
        title: string;
        price: number;
        userId: string;
        version: number;
    };
}