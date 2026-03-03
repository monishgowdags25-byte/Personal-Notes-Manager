import React, { useState, useRef, useEffect } from 'react';
import { MdClose, MdDragIndicator } from 'react-icons/md';

const StickyNote = ({ note, onUpdate, onDelete }) => {
    const [content, setContent] = useState(note.content);
    const [color, setColor] = useState(note.color);
    const [position, setPosition] = useState({ x: note.x, y: note.y });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const noteRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Sync state with props if props change (e.g. from refresh)
    useEffect(() => {
        setContent(note.content);
        setColor(note.color);
        setPosition({ x: note.x, y: note.y });
    }, [note]);

    // Handle Dragging
    const handleMouseDown = (e) => {
        if (e.target.closest('.sticky-header')) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                saveChanges({ x: position.x, y: position.y });
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, position]);

    // Debounced Save
    const saveChanges = (updates) => {
        const newData = {
            ...note,
            content: content,
            color: color,
            x: position.x,
            y: position.y,
            ...updates
        };

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        // Immediate save for drag end, debounced for text/color
        if (updates.x !== undefined || updates.y !== undefined) {
            onUpdate(note._id, newData);
        } else {
            debounceTimerRef.current = setTimeout(() => {
                onUpdate(note._id, newData);
            }, 1000);
        }
    };

    const handleContentChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);
        saveChanges({ content: newContent });
    };

    const handleColorChange = (newColor) => {
        setColor(newColor);
        saveChanges({ color: newColor });
    };

    return (
        <div
            ref={noteRef}
            className="absolute rounded-xl flex flex-col overflow-hidden transition-all duration-300 group"
            style={{
                top: position.y,
                left: position.x,
                width: '240px',
                height: '240px',
                backgroundColor: color,
                zIndex: isDragging ? 2000 : 100,
                transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                cursor: isDragging ? 'grabbing' : 'auto',
                boxShadow: isDragging
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Header / Drag Handle */}
            <div
                className="sticky-header h-8 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing border-b border-black/5"
                style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
            >
                <MdDragIndicator className="text-gray-400 opacity-50" />
                <button
                    className="hover:bg-black/10 rounded-full p-1 transition-colors"
                    onClick={() => onDelete(note._id || note.id)}
                    title="Delete Sticky Note"
                    onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                >
                    <MdClose className="text-gray-600 text-sm" />
                </button>
            </div>

            {/* Content Area */}
            <textarea
                className="w-full flex-grow p-3 bg-transparent border-none outline-none resize-none text-gray-800 text-sm font-medium leading-relaxed custom-scrollbar"
                style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' }}
                value={content}
                onChange={handleContentChange}
                placeholder="Write something..."
                onMouseDown={(e) => e.stopPropagation()} // Allow text selection
            />

            {/* Color Palette (Hover to show?) - kept simple at bottom */}
            <div className="flex justify-around p-2 bg-black/5 h-8 items-center" onMouseDown={(e) => e.stopPropagation()}>
                {[
                    "#fff3cd", // Yellow
                    "#f8d7da", // Red
                    "#d4edda", // Green
                    "#d1ecf1", // Blue
                    "#e2d1f0", // Purple
                    "#fce1e4"  // Pink
                ].map(c => (
                    <button
                        key={c}
                        className={`w-4 h-4 rounded-full border border-gray-300 transition-transform ${color === c ? 'ring-1 ring-gray-600 scale-110' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                        onClick={() => handleColorChange(c)}
                        title="Change Color"
                    />
                ))}
            </div>
        </div>
    );
};

export default StickyNote;
