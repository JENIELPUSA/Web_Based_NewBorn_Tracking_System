const Vaccine = require("../Models/VaccineModel");
const dayjs = require("dayjs");

async function checkVaccineExpiration() {
  console.log("🔄 Running checkVaccineExpiration service...");

  const now = dayjs();
  const soonThreshold = now.add(7, "day");

  console.log("📅 Current Date:", now.format("YYYY-MM-DD"));
  console.log("⏳ Soon Threshold (7 days):", soonThreshold.format("YYYY-MM-DD"));

  const vaccines = await Vaccine.find();

  console.log(`📦 Found ${vaccines.length} vaccines in database`);

  let expiredList = [];
  let expiringSoonList = [];

  vaccines.forEach((vaccine) => {
    vaccine.batches.forEach((batch) => {
      const expiration = dayjs(batch.expirationDate);

      console.log(
        `🔍 Checking batch for vaccine: ${vaccine.name} | Expiration: ${expiration.format("YYYY-MM-DD")} | Stock: ${batch.stock}`
      );

      if (expiration.isBefore(now, "day")) {
        console.log(`❌ EXPIRED → ${vaccine.name} (Expired: ${expiration.format("YYYY-MM-DD")})`);
        expiredList.push({
          vaccine: vaccine.name,
          expirationDate: batch.expirationDate,
          stock: batch.stock,
        });
      } else if (expiration.isBefore(soonThreshold, "day")) {
        console.log(`⚠️ EXPIRING SOON → ${vaccine.name} (Expires: ${expiration.format("YYYY-MM-DD")})`);
        expiringSoonList.push({
          vaccine: vaccine.name,
          expirationDate: batch.expirationDate,
          stock: batch.stock,
        });
      }
    });
  });

  console.log("📌 Final Result:", {
    expiredListCount: expiredList.length,
    expiringSoonListCount: expiringSoonList.length,
  });

  return { expiredList, expiringSoonList };
}

module.exports = checkVaccineExpiration;
