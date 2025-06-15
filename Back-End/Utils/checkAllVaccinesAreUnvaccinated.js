const AssignedVaccine = require("../Models/AssignedVaccineSchema");
const VaccinationRecord = require("../Models/VaccinationRecord");
const Newborn = require("../Models/NewBornmodel");
const Notification = require("../Models/NotificationSchema");
const User = require("../Models/usermodel");
const sendEmail = require("../Utils/email");

const checkAllVaccinesAreUnvaccinated = async (newbornId, io) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  try {
    // 1. Kunin lahat ng assigned vaccines para sa newborn na ito (na hindi pa notified)
    const assignedVaccines = await AssignedVaccine.find({
      newborn: newbornId,
      notified: false,
    }).populate("vaccine");

    if (assignedVaccines.length === 0) return;

    let allVaccinesHaveZeroDoses = true;

    for (const assigned of assignedVaccines) {
      const record = await VaccinationRecord.findOne({
        vaccine: assigned.vaccine._id,
        newborn: assigned.newborn,
      });

      if (record && record.doses && record.doses.length > 0) {
        allVaccinesHaveZeroDoses = false;
        break;
      }
    }

    // 4. Kung hindi lahat ay may zero dose, huwag mag-notify
    if (!allVaccinesHaveZeroDoses) return;

    // 5. Kung umabot dito, ibig sabihin lahat ay walang dose
    const newborn = await Newborn.findById(newbornId).populate("motherName");

    if (!newborn) return;

    const fullName = `${newborn.firstName} ${newborn.lastName}`;
    const notificationMessage = `Alert: The child ${fullName} has not received any vaccinations.`;

    // 6. I-check kung may existing notification
    const existingNotification = await Notification.findOne({
      newborn: newbornId,
      type: "unvaccinated_alert",
    });

    if (existingNotification) return;

    // 7. Hanapin users sa parehong zone ng nanay
    const motherEmail = newborn?.motherName?.email || "";
    const motherZone = newborn?.motherName?.zone || "";

    const usersInSameZone = await User.find({ Designatedzone: motherZone });
    const userEmails = usersInSameZone.map((u) => u.email);
    if (motherEmail) userEmails.push(motherEmail);

    await Notification.create({
      message: notificationMessage,
      newborn: newbornId,
      types_of_message: "Unvaccinated Alert",
      type: "unvaccinated_alert",
    });

    await AssignedVaccine.updateMany(
      { newborn: newbornId, notified: false },
      { $set: { notified: true } }
    );

    try {
      await sendEmail({
        email: userEmails,
        subject: "Unvaccinated Child Alert",
        text: notificationMessage,
      });
      console.log("Email sent to:", userEmails.join(", "));
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    // 11. Magpadala ng socket notification
    io.emit("unvaccinated-alert", {
      message: notificationMessage,
      status: "pending",
      newbornId: newborn._id,
      createdAt: formattedDate,
    });

    console.log("Alert sent for completely unvaccinated child:", fullName);
  } catch (error) {
    console.error("Error in checkAllVaccinesAreUnvaccinated:", error);
  }
};

module.exports = checkAllVaccinesAreUnvaccinated;
