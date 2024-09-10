import ExpressError from "../utils/ExpressError.js";

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) {
      next(new ExpressError("Not authorized", 401));
    }

    const rolesArray = [...allowedRoles];

    const result = req.roles
      .map((role) => rolesArray.includes(role))
      .find((val) => val === true);

    if (!result) {
      next(new ExpressError("Not authorized", 401));
    }

    next();
  };
};

export default verifyRoles;
