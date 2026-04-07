function getClientIp(req) {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return req.socket?.remoteAddress?.replace("::ffff:", "") || null;
}

module.exports = getClientIp;
