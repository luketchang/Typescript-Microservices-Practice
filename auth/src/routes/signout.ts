import express from 'express';
import { logger } from '../logger'; 

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
    const sessionId = req.session?.id;
    logger.info('Received sign out request', { sessionId });
    req.session = null;
    
    logger.info('User signed out', { sessionId });
    res.send('Signed out.');
});

export { router as signoutRouter };