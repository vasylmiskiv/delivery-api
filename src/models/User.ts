import * as mongoose from "mongoose";
import { model } from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  email_verified: { type: Boolean, required: true, default: false },
  verification_token: { type: String, required: true },
  verification_token_time: { type: Date, required: true },
  phone: { type: String, required: true },
  photo: { type: String, required: false },
  password: { type: String, required: true },
  reset_password_token: { type: String, required: false },
  reset_password_token_time: { type: Date, required: false },
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true },
  // uuid: [{type: String}],
  created_at: { type: Date, required: true, default: new Date() },
  updated_at: { type: Date, required: true, default: new Date() },
});

export default model("users", userSchema);
