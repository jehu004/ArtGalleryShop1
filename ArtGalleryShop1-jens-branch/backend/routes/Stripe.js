const express = require("express");
const router  = express.Router();
const Stripe  = require("stripe");
const stripe  = Stripe(process.env.STRIPE_SECRET_KEY);

const DOMAIN = process.env.FRONTEND_URL || "http://localhost:5173";

// ✅ Create a Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  const { cart } = req.body;

  if (!Array.isArray(cart)) {
    return res.status(400).json({ error: "Invalid cart data" });
  }

  // only keep the fields you need
  const simplified = cart.map(i => ({
    _id:      i._id,
    title:    i.title,
    quantity: i.quantity,
    price:    i.price,
    imageUrl: i.imageUrl,
  }));

  // JSON → string → percent‑encode for URL safety
  const cartJson  = JSON.stringify(simplified);
  const cartParam = encodeURIComponent(cartJson);
  
  console.log("✅ DOMAIN used for Stripe redirect:", DOMAIN);
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: cart.map(item => ({
        price_data: {
          currency:    "nok",
          product_data:{ name: item.title },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: {
        allowed_countries: [
          "AL", "AD", "AM", "AT", "AZ", "BY", "BE", "BA", "BG", "HR", "CY", "CZ",
          "DK", "EE", "FI", "FR", "GE", "DE", "GR", "HU", "IS", "IE", "IT", "KZ",
          "XK", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "MK", "NO",
          "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "TR",
          "UA", "GB", "VA"
        ]
      },

      // still save the full cart JSON in metadata if you need it server‑side
      metadata: { cart: cartJson },

      success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${DOMAIN}/order-summary?cart=${cartParam}`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get session summary
router.get("/session/:id", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ["customer_details"],
    });

    const cart = JSON.parse(session.metadata?.cart || "[]");

    res.json({
      orderNumber:  session.id,
      customerName: session.customer_details?.name,
      email:        session.customer_details?.email,
      address:      session.customer_details?.address,
      cart,
      totalAmount:  session.amount_total / 100,
    });
  } catch (err) {
    console.error("❌ Failed to fetch session:", err);
    res.status(500).json({ error: "Failed to retrieve session data" });
  }
});

module.exports = router;