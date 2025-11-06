import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  avatar: String,
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
