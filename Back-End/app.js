const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const ErrorController = require("./Controller/errorController");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const PDFRoutes = require("./Routes/PDFRoutes");
const usersroutes = require("./Routes/UserRoutes");
const ProfillingRoutes=require("./Routes/ProfillingRoutes")
const VaccinationRecord = require("./Routes/VaccinationRecordRoute");
const AssignedPerBaby = require("./Routes/AssignedPerBabyRoute");
const VaccineRoutes = require("./Routes/VaccineRoutes");
const NewBornBabyRoutes = require("./Routes/NewBornBabyRoutes");
const BrandRoute = require("./Routes/BrandRoute");
const auditLogRoute = require("./Routes/auditLogRoute");
const NotifyRoute=require("./Routes/NotificationRoutes")
const authentic = require("./Routes/authRouter");
const Record = require("./Routes/RecordRoute")
const Parent = require("./Routes/ParentRoutes")
let app = express();

const logger = function (req, res, next) {
  console.log("Middleware Called");
  next();
};

app.use(express.json());
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SECRET_STR,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.CONN_STR,
      ttl: 24 * 60 * 60, 
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    //origin: "https://web-based-newborn-tracking-system.onrender.com",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(logger);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/users", usersroutes);

app.use("/api/v1/NewBorn", NewBornBabyRoutes);
app.use("/api/v1/Brand", BrandRoute);
app.use("/api/v1/LogAudit",auditLogRoute)
app.use("/api/v1/Vaccine", VaccineRoutes);
app.use("/api/v1/authentication", authentic);
app.use("/api/v1/GeneratePDF", PDFRoutes);
app.use("/api/v1/VaccinationRecord", VaccinationRecord);
app.use("/api/v1/Profilling", ProfillingRoutes);
app.use("/api/v1/AssignedPerBabyVaccine", AssignedPerBaby);
app.use("/api/v1/Notification", NotifyRoute);
app.use("/api/v1/Record", Record);
app.use("/api/v1/Parent",Parent);



app.use(ErrorController);

module.exports = app;
