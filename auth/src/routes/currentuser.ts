import express from 'express';
import { currentUser } from '@lt-ticketing/common';
import { logger } from '../logger';

const router = express.Router();

router.get(
    '/api/users/currentuser', 
    currentUser,
    (req, res) => {
        logger.info('Handling request for current user', { currentUser: req.currentUser });
        res.send({ currentUser: (req.currentUser || null) });
    }
);

export { router as currentUserRouter };