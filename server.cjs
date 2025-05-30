const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Stripe = require('stripe');

dotenv.config(); // Load .env file

const app = express();
const PORT = process.env.PORT || 4242;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
/*const allowedOrigins = [
  'http://localhost:3000',
  'https://bukola-f-dev.github.io',
  "https://stripe-backend-f060.onrender.com"
];*/

app.use(cors());

/*app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));*/
app.use(express.json()); // Parse JSON requests

app.get('/', (req, res) => {
  res.send('Stripe backend is live!');
});


// Optional: Send publishable key to frontend
app.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post('/create-payment-intent', async (req, res) => {
  const { items } = req.body;

  // Calculate total amount in cents
  const amount = items.reduce((total, item) => {
    return total + item.price * item.quantity * 100; // Convert to cents
  }, 0);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});