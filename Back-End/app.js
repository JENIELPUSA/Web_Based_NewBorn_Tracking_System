const express = require("express");
const cors = require("cors");

const morgan = require("morgan");

const ErrorController = require("./Controller/errorController");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const PDFRoutes = require("./Routes/PDFRoutes");
const usersroutes = require("./Routes/UserRoutes");

const VaccinationRecord=require("./Routes/VaccinationRecordRoute")

const IncomingRequest = require("./Routes/IncomingRequestRoute");

const categoryroutes = require("./Routes/CategoryRoutes");

const departmentroutes = require("./Routes/DepartmentRoutes");

const laboratoryroutes = require("./Routes/LaboratoryRoutes");

const Equipmentroutes = require("./Routes/EquipmentRoutes");
const VaccineRoutes = require("./Routes/VaccineRoutes");

const AssignEquipment = require("./Routes/AssignRoutes");

const MaintenanceRoutes = require("./Routes/RequestMaintenanceRoutes");

const MessageRequestRoutes = require("./Routes/MessaRoute");

const MaintenanceTypess = require("./Routes/TypesMaintenancRoute");

const NewBornBabyRoutes = require("./Routes/NewBornBabyRoutes");

const BrandRoute = require("./Routes/BrandRoute")

const authentic = require("./Routes/authRouter");
let app = express();

const logger = function (res, req, next) {
  console.log("Middleware Called");
  next();
};

app.use(express.json());

app.use(
  session({
    secret: process.env.SECRET_STR,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      //mongoUrl: 'mongodb+srv://admin:FV0X2MY5DafZ4kUJ@cluster0.qpiekbv.mongodb.net/ThesisDatabase?retryWrites=true&w=majority&appName=Cluster0',
      mongoUrl: process.env.LOCAL_CONN_STR,
      ttl: 24 * 60 * 60, // 24 hours in seconds
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    //origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(logger);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/users", usersroutes);

app.use("/api/v1/NewBorn", NewBornBabyRoutes);
app.use("/api/v1/Brand", BrandRoute);

app.use("/api/v1/Vaccine", VaccineRoutes);

app.use("/api/v1/departments", departmentroutes);

app.use("/api/v1/authentication", authentic);

app.use("/api/v1/categorys", categoryroutes);

app.use("/api/v1/laboratory", laboratoryroutes);

app.use("/api/v1/equipment", Equipmentroutes);

app.use("/api/v1/AssignEquipment", AssignEquipment);

app.use("/api/v1/MaintenanceRequest", MaintenanceRoutes);

app.use("/api/v1/TypesMaintenanceRequest", MaintenanceTypess);

app.use("/api/v1/MessageRequest", MessageRequestRoutes);

app.use("/api/v1/IncomingRequests", IncomingRequest);

app.use("/api/v1/GeneratePDF", PDFRoutes);

app.use("/api/v1/VaccinationRecord", VaccinationRecord);
VaccinationRecord

app.use(ErrorController);

module.exports = app;
