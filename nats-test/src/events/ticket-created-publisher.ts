import { Publisher } from "./base-publisher";
import { Subject } from './subject';
import { TicketCreatedEvent } from './ticket-created-event';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subject.TicketCreated = Subject.TicketCreated;
}