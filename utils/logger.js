const logger = (req, res, next) => {
  const safeBody = { ...req.body };
  if (safeBody.password) {
    safeBody.password = "********";
  }
  console.log(`${req.method} ${req.url}`, safeBody);
  next();
};

export default logger;
