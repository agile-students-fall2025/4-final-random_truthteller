import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  email: { type: String, required: true },
  name: { type: String, required: true }
});

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  accounts: [AccountSchema],
  currentAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
export default User;
