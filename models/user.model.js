const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  tag: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "user", enum: ["user", "admin", "operator"] },
  accountNumber:{ type: String, unique: true, sparse: true},
  profilePicture:{
    secure_url:{type:String},
    public_id:{type:String}
  },
  balance:{type:Number, required:true, default:10000}

}, { timestamps: true, strict: "throw" });

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
