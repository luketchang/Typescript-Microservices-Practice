import express from 'express';

const router = express.Router();

router.post('/api/users/sign-out', (req, res) => {
    res.send('Sign Out');
});

export { router as signoutRouter };