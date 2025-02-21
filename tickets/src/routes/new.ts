import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@lt-ticketing/common";

import { natsWrapper } from "../nats-wrapper";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { Ticket } from "../models/ticket";
import { logger } from "@lt-ticketing/common";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title required."),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be > 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    logger.info("Received ticket creation request", {
      title,
      price,
      userId: req.currentUser!.id,
    });

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await ticket.save();

    logger.info("Ticket created", {
      ticketId: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    logger.info("Ticket created event published", { ticketId: ticket.id });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
