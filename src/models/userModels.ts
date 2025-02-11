import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  userID:{ type: String },
  password: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
  UID: { type: String }
});

export const UserModel = model("User", UserSchema);
