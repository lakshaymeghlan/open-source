// src/models/contributionGuide.model.js
import mongoose from "mongoose";

const contributionGuideSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
  summary: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  cached: { type: Boolean, default: true },
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("ContributionGuide", contributionGuideSchema);
