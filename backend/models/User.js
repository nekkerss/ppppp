const mongoose =require ("mongoose")

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    CIN :{ type: String, required: true,unique:true },
    email: { type: String, required: true,unique:true },
    phone:{type :Number ,required: true},
    password: { type: String },
    role: { type: String, enum: ['user', 'admin', 'gestionnaire'], default: 'user' },
    emailVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    avatar: { type: String }
}, { timestamps: true });
const user =mongoose.model("User",UserSchema)

module.exports=user