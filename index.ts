import express from "express";
import bodyParser from "body-parser";

const app = express();

// app.use(express.json());
app.use(bodyParser.json());

app.use("/api/admin", require("./routes/admin"));
app.use("/api/blog", require("./routes/blog"));
app.use("/api/category", require("./routes/category"));
app.use("/api/comment", require("./routes/comment"));
app.use("/api/customer", require("./routes/customer"));
app.use("/api/gig", require("./routes/gig"));
app.use("/api/horoscope", require("./routes/horoscope"));
app.use("/api/horoscopeDescription", require("./routes/horoscopeDescription"));
app.use("/api/warlock", require("./routes/warlock"));

const server = app.listen(3001, () =>
  console.log("🚀 Server ready at: http://localhost:3001")
);
