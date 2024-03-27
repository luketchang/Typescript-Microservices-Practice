import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { 
    requireAuth, 
    validateRequest, 
    BadRequestError, 
    NotFoundError, 
    NotAuthorizedError,
    OrderStatus
} from '@lt-ticketing/common';
import { natsWrapper } from '../nats-wrapper';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { stripe } from '../stripe';
import { logger } from '../logger';

const router = express.Router();

router.post(
    '/api/payments',
    requireAuth,
    [
        body('token')
            .not()
            .isEmpty(),
        body('orderId')
            .not()
            .isEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        logger.info('Received payment creation request', { orderId, userId: req.currentUser?.id });
        const order = await Order.findById(orderId);

        if(!order) {
            logger.warn('Order not found', { orderId: orderId });
            throw new NotFoundError();
        }
        if(order.userId !== req.currentUser!.id) {
            logger.warn('Not authorized', { orderId: orderId, userId: req.currentUser?.id });
            throw new NotAuthorizedError();
        }
        if(order.status === OrderStatus.Cancelled) {
            logger.warn('Cannot pay for cancelled order', { orderId: orderId });
            throw new BadRequestError('Cannot pay for cancelled order.')
        }

        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,
            source: token
        });

        const payment = Payment.build({
            orderId,
            stripeId: charge.id
        });
        await payment.save();

        logger.info('Payment created', { paymentId: payment.id, orderId: payment.orderId, stripeId: payment.stripeId });

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        })

        logger.info('Payment created event published', { paymentId: payment.id });

        res.status(201).send(payment);
    }
);

export { router as createChargeRouter };