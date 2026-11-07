import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Deals4Meals API is running' });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
