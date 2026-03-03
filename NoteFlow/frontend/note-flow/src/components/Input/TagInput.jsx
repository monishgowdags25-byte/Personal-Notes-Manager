import React, {useState} from "react";
import { MdAdd, MdClose } from "react-icons/md";

const TagInput = ({ tags, setTags }) => {

    const [inputValue, setInputValue] = useState("");
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const addNewTag = () => {
        if (inputValue.trim() !== "") {
            setTags([...tags, inputValue.trim()]);
            setInputValue("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            addNewTag();
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="w-full">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={inputValue}
                    className="text-sm border px-2 py-1 rounded-lg outline-none w-32"
                    style={{ backgroundColor: "#ffffff", borderColor: "#16232a", color: "#16232a" }}
                    placeholder="Add tags"
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />

                <button 
                    className="p-1.5 rounded-full hover:opacity-70 flex-shrink-0"
                    style={{ backgroundColor: "#ff5b04" }}
                    onClick={addNewTag}
                >
                    <MdAdd className="text-white text-sm" />
                </button>
                
                {/* Display tags after the + icon */}
                {tags.map((tag, index) => (
                    <span 
                        key={index} 
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs"
                        style={{ backgroundColor: "#ff5b04", color: "#ffffff", border: "1px solid #ff5b04" }}
                    >
                        # {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="flex items-center justify-center">
                            <MdClose className="text-sm" style={{ color: "#ffffff" }} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TagInput;