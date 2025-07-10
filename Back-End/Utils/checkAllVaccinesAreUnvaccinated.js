const AssignedVaccine = require("../Models/AssignedVaccineSchema");
const VaccinationRecord = require("../Models/VaccinationRecord");
const Newborn = require("../Models/NewBornmodel");
const Notification = require("../Models/NotificationSchema");
const User = require("../Models/usermodel");
const sendEmail = require("../Utils/email");

const checkAllVaccinesAreUnvaccinated = async (newbornId, socket) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  try {
    const assignedVaccines = await AssignedVaccine.find({
      newborn: newbornId,
      notified: false,
    })
      .populate("vaccine")
      .populate("newborn");

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

    if (!allVaccinesHaveZeroDoses) return;

    const newborn = await Newborn.findById(newbornId).populate("motherName");
    if (!newborn) return;

    const fullName = `${newborn.firstName} ${newborn.lastName}`;
    const notificationMessage = `⚠️ Alert: The child ${fullName} has not received any vaccinations.`;
    const motherEmail = newborn?.motherName?.email || "";
    const motherZone = newborn?.motherName?.zone || "";

    // Check if notification already exists
    const existingNotification = await Notification.findOne({
      newborn: newbornId,
      type: "unvaccinated_alert",
    });
    if (existingNotification) return;

    // Find Admins and BHWs
    const adminUsers = await User.find({ role: "Admin" }, "_id email");
    const bhwUsers = await User.find(
      { role: "BHW", Designatedzone: motherZone },
      "_id email"
    );

    const allRecipients = [...adminUsers, ...bhwUsers];
    const viewerIds = allRecipients.map((user) => user._id);
    const userEmails = allRecipients.map((user) => user.email);
    if (motherEmail) userEmails.push(motherEmail);

    // Save notification
    await Notification.create({
      message: notificationMessage,
      newborn: newbornId,
      types_of_message: "Unvaccinated Alert",
      type: "unvaccinated_alert",
      viewers: viewerIds.map((id) => ({
        user: id,
        isRead: false,
        viewedAt: null,
      })),
    });

    // Mark as notified
    await AssignedVaccine.updateMany(
      { newborn: newbornId, notified: false },
      { $set: { notified: true } }
    );

    // Send email
    try {
      await sendEmail({
        email: userEmails,
        subject: "Unvaccinated Child Alert",
        text: notificationMessage,
      });
      console.log("📧 Email sent to:", userEmails.join(", "));
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
    }

    // ✅ Client-side emit
    if (socket && socket.connected) {
      socket.emit("unvaccinated-alert", {
        message: notificationMessage,
        status: "pending",
        newbornId: newborn._id,
        createdAt: formattedDate,
      });
      console.log("📨 Alert emitted via socket client");
    }

    console.log("✅ Alert sent for completely unvaccinated child:", fullName);
  } catch (error) {
    console.error("❌ Error in checkAllVaccinesAreUnvaccinated:", error);
  }
};

module.exports = checkAllVaccinesAreUnvaccinated;
