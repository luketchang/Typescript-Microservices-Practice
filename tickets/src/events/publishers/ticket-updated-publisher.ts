import { Subject, Publisher, TicketUpdatedEvent } from "@lt-ticketing/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subject.TicketUpdated = Subject.TicketUpdated;
}