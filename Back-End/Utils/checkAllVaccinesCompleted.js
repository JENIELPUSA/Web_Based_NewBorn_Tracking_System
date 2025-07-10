const AssignedVaccine = require("../Models/AssignedVaccineSchema");
const VaccinationRecord = require("../Models/VaccinationRecord");
const Newborn = require("../Models/NewBornmodel");
const Notification = require("../Models/NotificationSchema");
const User = require("../Models/usermodel");
const sendEmail = require("../Utils/email");

const checkAllVaccinesCompleted = async (newbornId, io) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  try {
    const assignedVaccines = await AssignedVaccine.find({ newborn: newbornId })
      .populate("vaccine")
      .populate({
        path: "newborn",
        populate: {
          path: "motherName",
          select: "email zone",
        },
      });

    if (assignedVaccines.length === 0) return;

    let allCompleted = true;
    let alreadyMarkedComplete = true;
    let hasOverdose = false;
    const completedVaccineNames = [];

    for (const assigned of assignedVaccines) {
      const record = await VaccinationRecord.findOne({
        vaccine: assigned.vaccine._id,
        newborn: assigned.newborn,
      });

      const dosesGiven = record?.doses?.length || 0;

      // ✅ Check for overdose
      if (dosesGiven > assigned.totalDoses) {
        hasOverdose = true;
        console.log(`❌ Overdose detected for ${assigned.vaccine.name} - ${dosesGiven} > ${assigned.totalDoses}`);
        break;
      }

      if (dosesGiven < assigned.totalDoses) {
        allCompleted = false;
        break;
      } else {
        completedVaccineNames.push(assigned.vaccine.name);
        if (!assigned.sentComplete) alreadyMarkedComplete = false;
      }
    }

    if (hasOverdose) {
      console.log(`🚫 Completion notification blocked for newborn ${newbornId} due to overdose.`);
      return;
    }

    if (allCompleted && !alreadyMarkedComplete) {
      const newborn = assignedVaccines[0]?.newborn;
      if (!newborn) {
        console.log(`Newborn with ID ${newbornId} not found.`);
        return;
      }

      const fullName = `${newborn.firstName} ${newborn.lastName}`;
      const vaccineList = completedVaccineNames.join(", ");
      const notificationMessage = `✅ All vaccines are complete for ${fullName}. Completed vaccines: ${vaccineList}.`;
      const motherEmail = newborn?.motherName?.email;
      const motherZone = newborn?.motherName?.zone;

      const adminUsers = await User.find({ role: "Admin" }, "_id email");
      const bhwUsers = await User.find({ role: "BHW", Designatedzone: motherZone }, "_id email");

      const allRecipients = [...adminUsers, ...bhwUsers];
      const viewerIds = allRecipients.map((user) => user._id);
      const emails = allRecipients.map((user) => user.email);

      if (motherEmail) emails.push(motherEmail);

      const existingNotification = await Notification.findOne({
        newborn: newbornId,
        type: "vaccine_completion",
      });

      if (!existingNotification) {
        const saved = await Notification.create({
          newborn: newbornId,
          type: "vaccine_completion",
          message: notificationMessage,
          viewers: viewerIds.map((id) => ({
            user: id,
            isRead: false,
            viewedAt: null,
          })),
        });

        console.log("📥 Notification saved to DB:", saved._id);

        try {
          await sendEmail({
            email: emails,
            subject: "Vaccination Completed",
            text: notificationMessage,
          });
          console.log("📧 Email sent to:", emails.join(", "));
        } catch (err) {
          console.error("❌ Failed to send email:", err);
        }
      }

      await AssignedVaccine.updateMany(
        { newborn: newbornId, sentComplete: false },
        { $set: { sentComplete: true } }
      );

      // 🔔 Emit via socket if connected
      if (io && global.connectedUsers) {
        viewerIds.forEach((userId) => {
          const user = global.connectedUsers[userId.toString()];
          if (user && user.socketId) {
            io.to(user.socketId).emit("all-vaccines-completed", {
              message: notificationMessage,
              status: "pending",
              newbornId: newborn._id,
              createdAt: formattedDate,
            });
            console.log(`📨 Sent socket notification to user ${userId}`);
          }
        });
      }
    }
  } catch (error) {
    console.error("❌ Error in checkAllVaccinesCompleted:", error);
  }
};

module.exports = checkAllVaccinesCompleted;
