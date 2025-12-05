export const validateTestKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.TEST_API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid or missing API key' });
  }
  
  next();
};

