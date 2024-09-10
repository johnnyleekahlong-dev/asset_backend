import allowedOrigins from "./allowedOrigins.js";

const corsOptions = {
  // origin: (origin, callback) => {
  //   if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error("Not allowed by CORS"));
  //   }
  // },
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  credentials: true, // This allows cookies to be sent
  allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
};

export default corsOptions;
