const path = require("path");
const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

// Serve the static frontend
app.use(express.static(path.join(__dirname, "..", "client")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Cloud Solution Estimator running on http://localhost:${PORT}`);
});
