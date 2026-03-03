import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="w-80 flex items-center px-4 bg-white/70 backdrop-blur-lg border border-white/50 rounded-xl shadow-sm hover:bg-white/80 transition-all duration-300 focus-within:bg-white/90 focus-within:border-blue-300/50">
            <input
            type="text"
            placeholder="Search Notes"
            className="w-full text-sm bg-transparent py-3 outline-none text-[#16232a] placeholder-gray-500"
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            />

            {value && (
            <IoMdClose className="text-xl text-slate-500 cursor-pointer hover:text-[#ff5b04] mr-3 transition-colors duration-300" onClick={onClearSearch} />
            )}

            <FaMagnifyingGlass className="text-slate-400 cursor-pointer hover:text-[#075056] transition-colors duration-300" onClick={handleSearch} />

        </div>
    );
};

export default SearchBar;