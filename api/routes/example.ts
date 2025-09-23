import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Hello from Express API!',
    method: req.method,
    path: req.path,
    headers: req.headers,
  });
});

export default router;
