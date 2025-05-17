const cron = require('node-cron');
const Schedule = require('../Models/TypesOfMaintenace'); // Your model
const socketIO = require('socket.io-client'); // For sending notifications via Socket.IO

// Replace with your actual server URL
// Set up Socket.IO client to send notifications to the server
const socket = socketIO(`https://mywebapplicationapi.onrender.com`);
// Ensure the socket connection is established before emitting notifications
socket.on('connect', () => {
  cron.schedule('0 7 * * *', async () => {
    const today = new Date();
    console.log("Today:", today.toISOString());
    
    try {
      // Find all maintenance schedules that have a nextMaintenanceDate set and are not yet notified
      const schedules = await Schedule.find({
        nextMaintenanceDate: { $lte: today, $ne: null },
        notified: false,
      });  

      for (const schedule of schedules) {
        const nextMaintenanceDate = new Date(schedule.nextMaintenanceDate);
        console.log("Next Maintenance Date:", nextMaintenanceDate.toISOString());
        
        const oneDayAhead = new Date(today);
        oneDayAhead.setDate(today.getDate() + 1);
        console.log("One Day Ahead:", oneDayAhead.toISOString());
  
        // Check if the schedule is overdue or due in the next day
        if (nextMaintenanceDate <= oneDayAhead) {
          const isTypeNotification = schedule.notified;
          console.log("isTypeNotification", isTypeNotification);
          
          if (!isTypeNotification) {
            sendSocketNotification(socket, schedule);
            
            // Mark this schedule as notified
            schedule.notified = true;
            await schedule.save(); // Ensure the updated schedule is saved with notified status
            console.log(`Notification sent for schedule ${schedule._id}`);
          } else {
            console.log(`Schedule ${schedule._id} has already been notified.`);
          }
        } else {
          console.log(`Schedule ${schedule._id} is not yet due.`);
        }
      }
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
    }
  });
  

  console.log('Cron job for maintenance notifications is set up.');
});

// Function to send Socket.IO notification to the client
function sendSocketNotification(socket, schedule) {
  // Emit a message to the client
  socket.emit('send-notifications', {
    equipmentType: schedule.equipmentType,
    Laboratory: schedule.Laboratory,
    Department:schedule.Department,
    nextMaintenanceDate: schedule.nextMaintenanceDate,
    Description: `For ${schedule.scheduleType} Maintenance.`,
  });
}
