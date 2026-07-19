const path = require("path");
const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

// Serve the built Angular app (run `npm run build:client` first — see README)
const clientDist = path.join(__dirname, "..", "client", "dist", "browser");
app.use(express.static(clientDist));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Cloud Solution Estimator running on http://localhost:${PORT}`);
});
