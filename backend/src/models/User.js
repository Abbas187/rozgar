const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['Buyer', 'Provider', 'Admin'],
            required: true,
        },
        phone: {
            type: String,
        },
        location: {
            type: String,
        },
        profilePicture: {
            type: String,
            default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        },
        walletBalance: {
            type: Number,
            default: 0,
        },
        // Provider specific fields
        skills: {
            type: [String],
            default: [],
        },
        rating: {
            type: Number,
            default: 0,
        },
        completedJobs: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
