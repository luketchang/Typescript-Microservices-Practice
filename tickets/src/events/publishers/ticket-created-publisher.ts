import { Subject, Publisher, TicketCreatedEvent } from "@lt-ticketing/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subject.TicketCreated = Subject.TicketCreated;
}