export const access = (...roles) => {
  return (req, res, next) => {
    const role = req?.role;

    console.log(role,"role")

    if (role && roles.includes(role)) {
      next();
    } else {
      return res.status(403).json({ message: "Access Denied" });
    }
  };
};


