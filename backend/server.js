const express = require("express");
const cors = require("cors");
const Connectdb = require("./connectdb");
require("dotenv").config();

const app = express();

// Connect DB
Connectdb();

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/contracts", require("./routes/contractRoutes"));
app.use("/api/quotes", require("./routes/quoteRoutes"));
app.use("/api/claims", require("./routes/claimRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

// Static folder
app.use("/uploads", express.static(__dirname + "/uploads"));

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("Server running on port " + PORT);
});