import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Navbar from "../../components/Navbar/Navbar";
import { MdEdit, MdCameraAlt } from "react-icons/md";

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    profilePicture: ""
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo({
          fullName: response.data.user.fullName || "",
          email: response.data.user.email || "",
          profilePicture: response.data.user.profilePicture || ""
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        setError("Failed to fetch user information");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.put("/update-user", userInfo);
      if (response.data && response.data.user) {
        setUserInfo({
          fullName: response.data.user.fullName || "",
          email: response.data.user.email || "",
          profilePicture: response.data.user.profilePicture || ""
        });
        setSuccess("Profile updated successfully");
      }
    } catch (error) {
      setError("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#e4eef0" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: "#075056" }}></div>
      </div>
    );
  }

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#e4eef0" }}>
      <Navbar onLogout={onLogout} />

      <div className="pt-32 pb-12 px-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: "#e4eef0" }}>
            <h1 className="text-2xl font-bold" style={{ color: "#16232a" }}>Profile Settings</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(22, 35, 42, 0.7)" }}>
              Manage your profile information
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-3 rounded-lg" style={{ backgroundColor: "rgba(255, 91, 4, 0.1)", color: "#ff5b04" }}>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 rounded-lg" style={{ backgroundColor: "rgba(7, 80, 86, 0.1)", color: "#075056" }}>
                {success}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Picture Section */}
                <div className="md:w-1/3">
                  <div className="flex flex-col items-center">
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 border-4 border-white shadow-md transition-all group-hover:brightness-90">
                        {userInfo.profilePicture ? (
                          <img
                            src={userInfo.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-4xl font-bold" style={{ color: "#16232a" }}>
                            {userInfo.fullName ? userInfo.fullName.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                          <MdCameraAlt className="text-white text-2xl" />
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </div>
                    <p className="text-sm text-center" style={{ color: "rgba(22, 35, 42, 0.7)" }}>
                      Click to change
                    </p>
                  </div>
                </div>

                {/* Profile Info Section */}
                <div className="md:w-2/3">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "#16232a" }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={userInfo.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                        style={{
                          borderColor: "#e4eef0",
                          backgroundColor: "#f8f9fa",
                          focusRingColor: "rgba(7, 80, 86, 0.2)"
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "#16232a" }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userInfo.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                        style={{
                          borderColor: "#e4eef0",
                          backgroundColor: "#f8f9fa",
                          focusRingColor: "rgba(7, 80, 86, 0.2)"
                        }}
                        placeholder="Enter your email"
                        disabled
                      />
                      <p className="text-xs mt-1" style={{ color: "rgba(22, 35, 42, 0.5)" }}>
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={updating}
                        className="w-full md:w-auto px-6 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-all shadow-md"
                        style={{ backgroundColor: "#075056" }}
                      >
                        {updating ? "Updating..." : "Update Profile"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;