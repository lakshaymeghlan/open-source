import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  githubId: { type: String, unique: true },
  name: String,
  fullName: String,
  description: String,
  htmlUrl: String,
  avatar: String,
  techTags: [String],
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  stars: Number,
  forks: Number,
  openIssues: Number,
  topics: [String],
  lastSyncedAt: Date,
});

export default mongoose.model("Project", projectSchema);
