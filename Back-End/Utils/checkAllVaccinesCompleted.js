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
    const completedVaccineNames = [];

    for (const assigned of assignedVaccines) {
      const record = await VaccinationRecord.findOne({
        vaccine: assigned.vaccine._id,
        newborn: assigned.newborn,
      });

      const dosesGiven = record?.doses?.length || 0;

      if (dosesGiven < assigned.totalDoses) {
        allCompleted = false;
        break;
      } else {
        completedVaccineNames.push(assigned.vaccine.name);
        if (!assigned.sentComplete) alreadyMarkedComplete = false;
      }
    }

    if (allCompleted && !alreadyMarkedComplete) {
      const newborn = assignedVaccines[0]?.newborn;
      if (!newborn) {
        console.log(`Newborn with ID ${newbornId} not found.`);
        return;
      }

      const fullName = `${newborn.firstName} ${newborn.lastName}`;
      const vaccineList = completedVaccineNames.join(", ");
      const notificationMessage = `All vaccines are complete for ${fullName}. The completed vaccines are: ${vaccineList}.`;
      const motherEmail = newborn?.motherName?.email;
      const motherZone = newborn?.motherName?.zone;

      console.log("Mother's Email:", motherEmail);
      console.log("Mother's Zone:", motherZone);

      const bhwUsers = await User.find({ Designatedzone: motherZone });
      const adminUsers = await User.find({ role: "Admin" });

      const allRecipients = [...bhwUsers, ...adminUsers];
      const emails = allRecipients.map((user) => user.email);
      if (motherEmail) emails.push(motherEmail); // Add mother's email

      const existingNotification = await Notification.findOne({
        newborn: newbornId,
        type: "vaccine_completion",
      });

      if (!existingNotification) {
        await Notification.create({
          message: notificationMessage,
          newborn: newbornId,
          types_of_message: "Check Completed",
          type: "vaccine_completion",
        });

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

      io.emit("all-vaccines-completed", {
        message: notificationMessage,
        status: "pending",
        newbornId: newborn._id,
        createdAt: formattedDate,
      });

      console.log(" All vaccines completed for newborn:", fullName);
    }

  } catch (error) {
    console.error("Error in checkAllVaccinesCompleted:", error);
  }
};

module.exports = checkAllVaccinesCompleted;
