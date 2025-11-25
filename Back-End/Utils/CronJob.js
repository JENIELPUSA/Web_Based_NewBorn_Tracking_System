const cron = require("node-cron");
const VaccinationRecord = require("../Models/VaccinationRecord");
const Notification = require("../Models/NotificationSchema");
const User = require("../Models/usermodel");
const socketIO = require("socket.io-client");
const checkAllVaccinesAreUnvaccinated = require("../Utils/checkAllVaccinesAreUnvaccinated");
const Newborn = require("../Models/NewBornmodel");
const sendEmail = require("../Utils/email");

// ⬇️ IMPORT THE EXPIRATION CHECK LOGIC
const checkVaccineExpiration = require("../Utils/checkVaccineExpiration");

const socket = socketIO("https://web-based-newborn-tracking-system-server.onrender.com", {
// const socket = socketIO("http://localhost:3000", {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket"],
});

socket.on("connect", () => {});
socket.on("connect_error", (err) => {
  socket.connect();
});

cron.schedule("0 7 * * *", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  try {
    const records = await VaccinationRecord.find()
      .populate({
        path: "newborn",
        populate: { path: "motherName", model: "Parent" },
      })
      .populate("vaccine");

    for (const record of records) {
      const newborn = record.newborn;
      const mother = newborn?.motherName;

      const fullName = `${newborn?.firstName} ${newborn?.lastName}`;
      const zone = (mother?.zone || "").trim().toLowerCase();

      for (const dose of record.doses) {
        if (!dose.next_due_date) continue;

        const dueDate = new Date(dose.next_due_date);

        if (dueDate >= tomorrow && dueDate <= endOfTomorrow) {
          const adminUsers = await User.find({ role: "Admin" }, "_id email");

          const bhwUsers = await User.find(
            {
              role: "BHW",
              Designatedzone: { $regex: `^${zone}$`, $options: "i" },
            },
            "_id email Designatedzone"
          );

          const allRecipients = [...adminUsers, ...bhwUsers];
          const viewerIds = allRecipients.map((u) => u._id.toString());
          if (mother?._id) viewerIds.push(mother._id.toString());

          const emails = allRecipients.map((u) => u.email);
          if (mother?.email) emails.push(mother.email);

          const message = `💉 Reminder: Dose ${dose.doseNumber} of "${record.vaccine?.name}" for ${fullName} is due on ${dueDate.toLocaleDateString()}.`;

          // ➤ SOCKET EMIT FOR DUE DATE
          if (socket.connected) {
            socket.emit("send-vaccine-notification", {
              types_of_message: "Vaccine_due_date",
              message,
            });
          }

          const uniqueViewerIds = [...new Set(viewerIds)];

          await Notification.create({
            message,
            newborn: newborn._id,
            types_of_message: "Vaccine_due_date",
            type: "vaccine_due",
            viewers: uniqueViewerIds.map((id) => ({
              user: id,
              isRead: false,
              viewedAt: null,
            })),
          });

          try {
            await sendEmail({
              email: emails,
              subject: "Vaccine Dose Reminder",
              text: message,
            });
          } catch (err) {}
        }
      }
    }

    // ➤ CHECK IF NEWBORN HAS ALL UNVACCINATED
    const allNewborns = await Newborn.find();
    for (const nb of allNewborns) {
      await checkAllVaccinesAreUnvaccinated(nb._id, socket);
    }

    // ==========================================================
    // ⭐⭐ INSERTED: VACCINE EXPIRATION CHECK + EMIT ⭐⭐
    // ==========================================================

    const { expiredList, expiringSoonList } = await checkVaccineExpiration();

    if (socket.connected && (expiredList.length > 0 || expiringSoonList.length > 0)) {
      socket.emit("vaccine-expiration-alert", {
        expired: expiredList,
        expiringSoon: expiringSoonList,
        message: "⚠️ There are vaccine batches that are expired or near expiration.",
      });
    }

    // OPTIONAL: Save notification in DB
    if (expiredList.length > 0 || expiringSoonList.length > 0) {
      await Notification.create({
        message: "⚠️ Vaccine batch expiration alert detected.",
        type: "vaccine_expiration",
        types_of_message: "Vaccine_expiration",
        viewers: [], // add admin users if needed
      });
    }

    // ==========================================================

  } catch (err) {}
});
