"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subject = void 0;
var Subject;
(function (Subject) {
    Subject["TicketCreated"] = "ticket:created";
    Subject["TicketUpdated"] = "ticket:updated";
    Subject["OrderCreated"] = "order:created";
    Subject["OrderCancelled"] = "order:cancelled";
    Subject["ExpirationComplete"] = "expiration:complete";
    Subject["PaymentCreated"] = "payment:created";
})(Subject = exports.Subject || (exports.Subject = {}));
