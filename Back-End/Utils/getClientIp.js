function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  let ip =
    forwarded?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    null;

  if (!ip) return null;
  if (ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");

  return ip;
}

module.exports = getClientIp;