const express = require("express");
const app = express();
app.use(express.json()); 


app.use(express.json());

const indexRoutes = require("./routes/index");

app.use("/", indexRoutes);
module.exports = app;
