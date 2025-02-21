import express, { Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@lt-ticketing/common";
import { Order } from "../models/order";
import { logger } from "@lt-ticketing/common";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    logger.info("Received order retrieval request", {
      orderId,
      userId: req.currentUser!.id,
    });

    const order = await Order.findById(orderId).populate("ticket");

    if (!order) {
      logger.warn("Order not found", { order });
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      logger.warn("Not authorized to view order", {
        order,
        userId: req.currentUser!.id,
      });
      throw new NotAuthorizedError();
    }

    logger.info("Order retrieved", { order });

    res.send(order);
  }
);

export { router as showOrderRouter };
