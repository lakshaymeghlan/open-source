import app from "./app.js";
import dotenv from "dotenv";
import startFullSyncJob from "./jobs/fullSync.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
startFullSyncJob();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
