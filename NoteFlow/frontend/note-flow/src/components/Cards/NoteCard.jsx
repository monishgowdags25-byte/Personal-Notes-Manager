import React from "react";
import { MdOutlinePushPin, MdCreate, MdDelete, MdDraw, MdImage, MdAudiotrack } from "react-icons/md";
import moment from "moment";

const NoteCard = ({
    title,
    date,
    content,
    tags,
    isPinned,
    onEdit,
    onDelete,
    onPinNote,
    doodle,
    mediaAttachments,
    voiceAttachments,
    priority
}) => {
    // Function to determine priority color using the app's color scheme
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': 
            case 'urgent': 
                return 'bg-red-500 text-white';
            case 'medium': 
                return 'bg-yellow-500 text-black';
            case 'low': 
                return 'bg-green-500 text-white';
            default: 
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Count total attachments
    const attachmentCount = (doodle ? 1 : 0) + (mediaAttachments?.length || 0) + (voiceAttachments?.length || 0);

    return (
        <div 
            className="border rounded-lg p-3 hover:shadow-xl transition-all ease-in-out hover:-translate-y-1"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#16232a", minHeight: "180px", maxHeight: "180px", display: "flex", flexDirection: "column" }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h6 className="font-bold truncate" style={{ color: "#16232a", fontSize: "1rem" }}>{title}</h6>
                    <span className="text-xs" style={{ color: "#075056" }}>{moment(date).format("MMM DD, YYYY")}</span>
                </div>

                <div className="flex items-center space-x-2">
                    <button 
                        className={`p-1 rounded-full transition-all hover:opacity-90 ${
                            isPinned 
                                ? "bg-orange-100 text-orange-600" 
                                : "text-gray-400 hover:text-orange-500"
                        }`}
                        onClick={onPinNote}
                        style={{ 
                            backgroundColor: isPinned ? "#ff5b04" : "transparent",
                            color: isPinned ? "#e4eef0" : "#16232a"
                        }}
                    >
                        <MdOutlinePushPin className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <p className="text-xs mt-2 line-clamp-3" style={{ color: "#16232a", lineHeight: "1.3", flex: 1, overflow: "hidden" }}>{content?.slice(0, 60)}{content?.length > 60 ? '...' : ''}</p>
            
            {/* Priority Tag */}
            <div className="mt-2">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                    {priority?.charAt(0).toUpperCase() + priority?.slice(1)} Priority
                </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
                {tags && tags.slice(0, 3).map((tag, index) => (
                    <span 
                        key={index} 
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium transition-all hover:opacity-90"
                        style={{ backgroundColor: "#e4eef0", color: "#16232a" }}
                    >
                        #{tag}
                    </span>
                ))}
                {tags && tags.length > 3 && (
                    <span 
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium transition-all hover:opacity-90"
                        style={{ backgroundColor: "#075056", color: "#e4eef0" }}
                    >
                        +{tags.length - 3}
                    </span>
                )}
            </div>

            {/* Attachments */}
            {attachmentCount > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {doodle && (
                        <div className="flex items-center px-1.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#e4eef0", color: "#16232a" }}>
                            <MdDraw className="w-2.5 h-2.5 mr-1" />
                            Doodle
                        </div>
                    )}
                    {mediaAttachments && mediaAttachments.length > 0 && (
                        <div className="flex items-center px-1.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#e4eef0", color: "#16232a" }}>
                            <MdImage className="w-2.5 h-2.5 mr-1" />
                            {mediaAttachments.length} Media
                        </div>
                    )}
                    {voiceAttachments && voiceAttachments.length > 0 && (
                        <div className="flex items-center px-1.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#e4eef0", color: "#16232a" }}>
                            <MdAudiotrack className="w-2.5 h-2.5 mr-1" />
                            {voiceAttachments.length} Voice
                        </div>
                    )}
                </div>
            )}

            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {attachmentCount > 0 && (
                        <span className="text-xs" style={{ color: "#075056" }}>
                            {attachmentCount} attachment{attachmentCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    <button 
                        className="p-1 rounded-full hover:bg-slate-100 transition-all"
                        style={{ color: "#16232a" }}
                        onClick={onEdit}
                    >
                        <MdCreate className="w-3 h-3" />
                    </button>
                    <button 
                        className="p-1 rounded-full hover:bg-red-100 transition-all"
                        style={{ color: "#ff5b04" }}
                        onClick={onDelete}
                    >
                        <MdDelete className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    )
};

export default NoteCard;