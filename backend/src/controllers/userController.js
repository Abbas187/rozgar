const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            location: user.location,
            profilePicture: user.profilePicture,
            walletBalance: user.walletBalance,
            skills: user.skills,
            rating: user.rating,
            completedJobs: user.completedJobs,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.location = req.body.location || user.location;
        user.profilePicture = req.body.profilePicture || user.profilePicture;

        if (user.role === 'Provider' && req.body.skills) {
            user.skills = req.body.skills;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            location: updatedUser.location,
            profilePicture: updatedUser.profilePicture,
            walletBalance: updatedUser.walletBalance,
            skills: updatedUser.skills,
            token: req.headers.authorization.split(' ')[1], // Return current token
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { getUserProfile, updateUserProfile };
