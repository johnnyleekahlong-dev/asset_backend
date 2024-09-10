const errorHandler = (err, req, res, next) => {
  const errorMessage = err.message || "Server error";
  const errorStatus = err.status || 500;

  console.log(err);

  res.status(errorStatus).json({
    message: errorMessage,
    stack: err.stack ? err.stack : "",
  });
};

export default errorHandler;
