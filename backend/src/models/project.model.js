// src/models/project.model.js (excerpt)
import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  githubId: { type: Number, index: true, unique: true, sparse: true },
  name: String,
  fullName: String,
  htmlUrl: String,
  description: String,
  avatar: String,
  stars: Number,
  forks: Number,
  openIssues: Number,
  techTags: [String],
  topics: [String],
  difficulty: String,
  lastSyncedAt: Date,
  // <-- new cached AI guide
  contributionGuide: {
    summary: { type: String, default: "" },   // human-readable output / markdown
    meta: { type: mongoose.Schema.Types.Mixed }, // optional structured metadata
    generatedAt: { type: Date }
  }
}, { timestamps: true });

const Project = mongoose.model('Project', ProjectSchema);
export default Project;
