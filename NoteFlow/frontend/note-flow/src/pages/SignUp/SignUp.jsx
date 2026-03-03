import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Camera } from "lucide-react";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";

const SignUp = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Function to get initials from full name
    const getInitials = (name) => {
        if (!name) return "";
        const names = name.split(" ");
        let initials = names[0].substring(0, 1).toUpperCase();

        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }

        return initials;
    };

    // Function to handle profile picture change
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.match("image.*")) {
                setError("Please select an image file");
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size should be less than 5MB");
                return;
            }

            setProfilePicture(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicturePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            setError("");
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!fullName) {
            setError("Please enter your full name");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (!password) {
            setError("Please enter a password");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError("");
        setIsLoading(true);

        // Prepare form data
        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("email", email);
        formData.append("password", password);

        // Add profile picture if available
        if (profilePicture) {
            formData.append("profilePicture", profilePicture);
        }

        // Sign Up API Call
        try {
            const response = await axiosInstance.post("/signup", {
                fullName: fullName,
                email: email,
                password: password,
                profilePicture: profilePicturePreview || ""
            });

            if (response.data && response.data.error) {
                setError(response.data.message);
                setIsLoading(false);
                return;
            }

            if (response.data && response.data.accessToken) {
                localStorage.setItem("token", response.data.accessToken);

                // Store user info
                localStorage.setItem("userInfo", JSON.stringify({
                    fullName: response.data.user.fullName,
                    email: response.data.user.email,
                    profilePicture: response.data.user.profilePicture || ""
                }));

                setIsLoading(false);
                navigate("/dashboard");
            }
        } catch (error) {
            setIsLoading(false);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#16232a] relative overflow-hidden">
            {/* Background image with blur effect */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/background.jpg')" }}
            >
                <div className="absolute inset-0 bg-[#16232a]/70 backdrop-blur-sm"></div>
            </div>

            {/* Glassmorphic Sign Up Card */}
            <motion.div
                className="relative w-full max-w-md mx-4 bg-[#e4eef0]/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Inner glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#075056]/10 to-[#ff5b04]/5 pointer-events-none"></div>

                <div className="relative z-10 p-6">
                    <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    >
                        <motion.h1
                            className="text-2xl font-bold text-white mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            Create Account
                        </motion.h1>
                        <motion.p
                            className="text-gray-200 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
                            Join NoteFlow to start organizing your notes
                        </motion.p>
                    </motion.div>

                    {/* Profile Picture Upload */}
                    <motion.div
                        className="flex justify-center mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.3 }}
                    >
                        <div className="relative">
                            <div
                                className="w-24 h-24 rounded-full bg-[#075056] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg cursor-pointer overflow-hidden"
                                style={{
                                    backgroundImage: profilePicturePreview ? `url(${profilePicturePreview})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                                onClick={() => document.getElementById('profile-picture-input').click()}
                            >
                                {!profilePicturePreview && (
                                    <span>{getInitials(fullName)}</span>
                                )}
                            </div>
                            <div
                                className="absolute bottom-0 right-0 bg-[#ff5b04] rounded-full p-2 shadow-lg cursor-pointer"
                                onClick={() => document.getElementById('profile-picture-input').click()}
                            >
                                <Camera className="h-4 w-4 text-white" />
                            </div>
                            <input
                                id="profile-picture-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePictureChange}
                            />
                        </div>
                    </motion.div>

                    <form onSubmit={handleSignUp}>
                        <motion.div
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                        >
                            <label className="block text-[#075056] text-xs font-semibold uppercase mb-1 tracking-wider">
                                User Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full pl-9 pr-4 py-2.5 bg-[#e4eef0] border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#075056] shadow-sm text-sm"
                                    value={fullName}
                                    onChange={(e) => {
                                        setFullName(e.target.value);
                                        // Update preview when name changes
                                        if (!profilePicture) {
                                            setProfilePicturePreview(null);
                                        }
                                    }}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                        >
                            <label className="block text-[#075056] text-xs font-semibold uppercase mb-1 tracking-wider">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    className="w-full pl-9 pr-4 py-2.5 bg-[#e4eef0] border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#075056] shadow-sm text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                        >
                            <label className="block text-[#075056] text-xs font-semibold uppercase mb-1 tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-9 pr-9 py-2.5 bg-[#e4eef0] border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#075056] shadow-sm text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-[#075056]" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400 hover:text-[#075056]" />
                                    )}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.3 }}
                        >
                            <label className="block text-[#075056] text-xs font-semibold uppercase mb-1 tracking-wider">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-9 pr-9 py-2.5 bg-[#e4eef0] border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#075056] shadow-sm text-sm"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-[#075056]" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400 hover:text-[#075056]" />
                                    )}
                                </button>
                            </div>
                        </motion.div>

                        {error && (
                            <motion.div
                                className="mb-3 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="text-red-300 text-xs">{error}</p>
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            className={`w-full py-2.5 px-4 bg-gradient-to-r from-[#ff5b04] to-[#ff7b1a] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            whileHover={!isLoading ? { scale: 1.02 } : {}}
                            whileTap={!isLoading ? { scale: 0.98 } : {}}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.3 }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                <>
                                    Sign Up
                                    <ArrowRight className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <motion.div
                        className="mt-4 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.3 }}
                    >
                        <p className="text-gray-200 text-xs">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-[#ff5b04] font-semibold hover:underline transition-all"
                            >
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUp;