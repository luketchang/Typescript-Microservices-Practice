import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';
import { logger } from './logger';

const start = async () => {
    if(!process.env.JWT_KEY) throw new Error('JWT_KEY not defined.');
    if(!process.env.ORDERS_MONGO_URI) throw new Error('TICKETS_MONGO_URI not defined.')
    if(!process.env.NATS_CLIENT_ID) throw new Error('NATS_CLIENT_ID not defined.');
    if(!process.env.NATS_CLUSTER_ID) throw new Error('NATS_CLUSTER_ID not defined.');
    if(!process.env.NATS_URL) throw new Error('NATS_URL not defined.');

    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID, 
            process.env.NATS_CLIENT_ID, 
            process.env.NATS_URL
        );
        
        natsWrapper.client.on('close', () => {
            logger.info('NATS connection closed!');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.ORDERS_MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        logger.info('Connected to MongoDB');
    } catch(err) {
        logger.error(err);
    }

    app.listen(3000, () => {
        logger.info('Listening on port 3000!');
    });
}

start();