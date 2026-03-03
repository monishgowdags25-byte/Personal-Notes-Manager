import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setError("Please enter the password");
            return;
        }

        setError("");
        setIsLoading(true);

        // Login API Call
        try {
            const response = await axiosInstance.post("/login", {
                email: email,
                password: password,
            });

            if (response.data && response.data.error) {
                setError(response.data.message);
                setIsLoading(false);
                return;
            }

            if (response.data && response.data.accessToken) {
                localStorage.setItem("token", response.data.accessToken);

                // Fetch user info and store it
                try {
                    const userResponse = await axiosInstance.get("/get-user");
                    if (userResponse.data && userResponse.data.user) {
                        localStorage.setItem("userInfo", JSON.stringify({
                            fullName: userResponse.data.user.fullName,
                            email: userResponse.data.user.email,
                            profilePicture: userResponse.data.user.profilePicture || ""
                        }));
                    }
                } catch (userError) {
                    console.error("Failed to fetch user info:", userError);
                }

                setIsLoading(false);
                navigate("/dashboard");
            }
        } catch (error) {
            setIsLoading(false);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                // Show the raw error message for debugging (e.g. "Network Error", "timeout")
                setError(`Request Failed: ${error.message}`);
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

            {/* Glassmorphic Login Card */}
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
                            Welcome Back
                        </motion.h1>
                        <motion.p
                            className="text-gray-200 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
                            Sign in to your NoteFlow account
                        </motion.p>
                    </motion.div>

                    <form onSubmit={handleLogin}>
                        <motion.div
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
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
                            transition={{ delay: 0.5, duration: 0.3 }}
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
                            transition={{ delay: 0.6, duration: 0.3 }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </span>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <motion.div
                        className="mt-4 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.3 }}
                    >
                        <p className="text-gray-200 text-xs">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-[#ff5b04] font-semibold hover:underline transition-all"
                            >
                                Sign up
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;