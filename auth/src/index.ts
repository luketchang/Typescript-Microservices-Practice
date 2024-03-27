import mongoose from 'mongoose';

import { app } from './app';
import { logger } from "./logger";

const start = async () => {
    if(!process.env.JWT_KEY) {
        throw new Error('JWT_KEY not defined.');
    }
    if(!process.env.AUTH_MONGO_URI) {
        throw new Error('JWT_KEY not defined.');
    }

    try {
        await mongoose.connect(process.env.AUTH_MONGO_URI, {
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