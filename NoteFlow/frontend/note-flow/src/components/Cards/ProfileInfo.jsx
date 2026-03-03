import React from "react";
import { Link } from "react-router-dom";
import { getInitials } from "../../utils/helper";

const ProfileInfo = ({ userInfo, onLogout }) => {
    return (
        userInfo && (
            <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-3 group transition-all">
                    {userInfo.profilePicture ? (
                        <img
                            src={userInfo.profilePicture}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-sm group-hover:border-[#ff5b04] transition-all"
                        />
                    ) : (
                        <div className="w-10 h-10 flex items-center justify-center rounded-full text-[#16232a] font-medium bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white/50 shadow-sm group-hover:border-[#ff5b04] transition-all">
                            {getInitials(userInfo.fullName)}
                        </div>
                    )}
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-[#16232a] group-hover:text-[#ff5b04] transition-all leading-none">{userInfo.fullName}</p>
                    </div>
                </Link>
                <div className="border-l border-white/20 h-8 mx-1"></div>
                <button
                    className="text-xs font-medium text-[#075056] hover:text-[#ff5b04] transition-all duration-300 bg-white/40 hover:bg-white/60 px-3 py-1.5 rounded-full shadow-sm"
                    onClick={(e) => {
                        e.preventDefault();
                        onLogout();
                    }}
                >
                    Logout
                </button>
            </div>
        )
    );
};
export default ProfileInfo;