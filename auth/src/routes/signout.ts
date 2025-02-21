import express from "express";
import { logger } from "@lt-ticketing/common";

const router = express.Router();

router.post("/api/users/signout", (req, res) => {
  const sessionId = req.session?.id;
  const sessionEmail = req.session?.email;

  logger.info("Received sign out request", { sessionEmail, sessionId });
  req.session = null;

  logger.info("User signed out", { sessionEmail, sessionId });
  res.send("Signed out.");
});

export { router as signoutRouter };
