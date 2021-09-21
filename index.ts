import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const router = express.Router();

// app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

// const options: cors.CorsOptions = {
//   allowedHeaders: [
//     "Origin",
//     "X-Requested-With",
//     "Content-Type",
//     "Accept",
//     "X-Access-Token",
//   ],
//   credentials: true,
//   methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
//   origin: "http://localhost:3000",
// };

const options: cors.CorsOptions = {
  optionsSuccessStatus: 200,
  origin: ["https://falzamani.vercel.app", "http://localhost:3000"],
  methods: "GET, PUT, POST",
};
//use cors middleware
app.use(cors(options));

//add your routes
// app.options("*", cors(options));

app.use("/api/admin", require("./routes/admin"));
app.use("/api/blog", require("./routes/blog"));
app.use("/api/category", require("./routes/category"));
app.use("/api/comment", require("./routes/comment"));
app.use("/api/customer", require("./routes/customer"));
app.use("/api/gig", require("./routes/gig"));
app.use("/api/horoscope", require("./routes/horoscope"));
app.use("/api/horoscopeDescription", require("./routes/horoscopeDescription"));
app.use("/api/warlock", require("./routes/warlock"));
app.use("/api/password", require("./routes/password"));
app.use("/api/contactUs", require("./routes/contactUs"));
app.use("/api/odeme", require("./routes/odeme"));
app.use("/api/date", require("./routes/date"));

const server = app.listen(process.env.PORT || 3001, () =>
  console.log("🚀 Server ready at: http://localhost:3001")
);
