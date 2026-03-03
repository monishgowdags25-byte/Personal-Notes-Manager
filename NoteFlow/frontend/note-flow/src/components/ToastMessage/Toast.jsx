import React, { useEffect } from "react";
import { LuCheck, LuX } from "react-icons/lu";

const Toast = ({ isShown, message, type = "success", onClose }) => {
    useEffect(() => {
        if (isShown) {
            const timeout = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [isShown, onClose]);

    if (!isShown) return null;

    const getIcon = () => {
        switch (type) {
            case "delete":
            case "error":
                return <LuX className="text-lg" style={{ color: "#e4eef0" }} />;
            case "success":
            case "add":
            default:
                return <LuCheck className="text-lg" style={{ color: "#e4eef0" }} />;
        }
    };

    const getIconBgColor = () => {
        switch (type) {
            case "delete":
            case "error":
                return "#ff5b04";
            case "success":
            case "add":
            default:
                return "#075056";
        }
    };

    return (
        <div className="fixed top-20 right-6 z-[9999] transition-all duration-300 animate-slide-in">
            <div
                className="min-w-52 rounded-lg shadow-lg flex items-center p-4"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #16232a" }}
            >
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: getIconBgColor() }}
                >
                    {getIcon()}
                </div>
                <p className="text-sm font-medium flex-1" style={{ color: "#16232a" }}>{message}</p>
                <button
                    onClick={onClose}
                    className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <LuX className="text-gray-500 hover:text-gray-700" />
                </button>
            </div>
        </div>
    );
};

export default Toast;