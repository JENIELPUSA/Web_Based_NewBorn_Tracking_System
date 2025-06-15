const cron = require("node-cron");
const VaccinationRecord = require("../Models/VaccinationRecord");
const Notification = require("../Models/NotificationSchema");
const User = require("../Models/usermodel");
const socketIO = require("socket.io-client");
const checkAllVaccinesAreUnvaccinated = require("../Utils/checkAllVaccinesAreUnvaccinated");
const Newborn = require("../Models/NewBornmodel");
const sendEmail = require("../Utils/email");
const socket = socketIO("https://web-based-newborn-tracking-system-server.onrender.com", {
//const socket = socketIO("http://localhost:3000", {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Socket connected in cron job");
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error in cron job:", err);
  socket.connect();
});

cron.schedule("0 7 * * *", async () => {
//cron.schedule("*/2 * * * *", async () => {
  console.log("Cron job triggered");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneDayAhead = new Date(today);
  oneDayAhead.setDate(today.getDate() + 1);
  oneDayAhead.setHours(23, 59, 59, 999);

  try {
    const records = await VaccinationRecord.find({
      "doses.next_due_date": { $lte: oneDayAhead },
      "doses.notified": false,
    })
      .populate({
        path: "newborn",
        populate: {
          path: "motherName",
          model: "User",
        },
      })
      .populate("vaccine")
      .populate("doses.administeredBy");

    console.log(`Found ${records.length} records with due doses`);

    for (const record of records) {
      const zone = record?.newborn?.motherName?.zone;

      const matchedUsers = await User.find({ Designatedzone: zone });

      if (matchedUsers.length > 0) {
        console.log(`Matched Users for Zone "${zone}":`);
        matchedUsers.forEach(user => {
          console.log(`- ${user.email}`);
        });
      } else {
        console.log(` No users found with designatedZone: ${zone}`);
      }


      for (const dose of record.doses) {
        if (dose.next_due_date && new Date(dose.next_due_date) <= oneDayAhead) {

          if (socket.connected) {
            sendSocketNotification(socket, record, dose);
            console.log(` Notification sent for dose ${dose.doseNumber} of "${record.vaccine?.name}"`);
          } else {
            console.log("Socket not connected, cannot send notification");
          }

          const newNotification = await Notification.create({
            message: `Reminder: Dose ${dose.doseNumber} of "${record.vaccine?.name}" for ${record.newborn?.firstName} ${record.newborn?.lastName} is due on ${new Date(dose.next_due_date).toLocaleDateString()}.`,
            newborn: record.newborn?._id,
            types_of_message: "Vaccine_due_date",
          });

          console.log("Notification saved:", newNotification);
          const emails = [
            ...matchedUsers.map(user => user.email), 
            record?.newborn?.motherName?.email,    
          ];

          const message = newNotification.message;

          try {
            await sendEmail({
              email: emails, 
              subject: 'New Notification',
              text: message,
            });

            console.log(`Email sent to: ${emails.join(", ")}`);
          } catch (error) {
            console.error("Failed to send email", error);
          }
          dose.notified = true;
        }
      }

      // Save the record after updating doses
      await record.save();
    }

    // Update all doses that haven't been notified yet in the records
   await VaccinationRecord.updateMany(
  { "doses.notified": false }, // Filter: records with any dose not yet notified
  {
    $set: {
      "doses.$[elem].notified": true // Update only those doses
    }
  },
  {
    arrayFilters: [{ "elem.notified": false }] // Apply only to doses with notified: false
  }
);

    console.log("All doses marked as notified");

    // Check unvaccinated newborns
    const allNewborns = await Newborn.find();
    for (const nb of allNewborns) {
      await checkAllVaccinesAreUnvaccinated(nb._id, socket);
    }
  } catch (error) {
    console.error("❗ Error in cron job:", error);
  }
});

// Function to send socket notification
function sendSocketNotification(socket, record, dose) {
  socket.emit("send-vaccine-notification", {
    types_of_message: "Vaccine_due_date",
    message: `Reminder: Dose ${dose.doseNumber} of "${record.vaccine?.name}" for ${record.newborn?.firstName} ${record.newborn?.lastName} is due on ${new Date(dose.next_due_date).toLocaleDateString()}.`,
  });
}
