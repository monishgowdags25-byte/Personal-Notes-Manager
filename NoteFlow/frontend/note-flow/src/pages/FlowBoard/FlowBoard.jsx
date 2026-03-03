import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/Navbar/Navbar';
import { Rnd } from 'react-rnd';
import {
    MdTextFields,
    MdImage,
    MdBrush,
    MdAttachFile,
    MdMic,
    MdZoomIn,
    MdZoomOut,
    MdDelete,
    MdColorLens,
    MdUndo,
    MdRedo,
    MdEdit,
    MdCleaningServices,
    MdRotateRight
} from 'react-icons/md';

const FlowBoard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [items, setItems] = useState(() => {
        // Load from cache for instant display
        try {
            const saved = localStorage.getItem('flowBoardItems');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const navigate = useNavigate();

    // Canvas State
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });

    // Get User Info
    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const response = await axiosInstance.get("/get-user");
                if (response.data && response.data.user) {
                    setUserInfo(response.data.user);
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
            }
        };
        getUserInfo();
        fetchItems();
    }, [navigate]);

    const fetchItems = async () => {
        try {
            const resp = await axiosInstance.get('/get-flow-items');
            if (resp.data && !resp.data.error) {
                setItems(resp.data.flowItems);
            }
        } catch (err) {
            console.error("Failed to fetch flow items", err);
        }
    };

    // Cache items safely whenever they change
    useEffect(() => {
        const cacheItems = items.map(item => {
            // Optimization: Don't cache large data strings (>50KB) to prevent Storage Quota errors
            // Use a placeholder instead, so layout loads instantly, content populates on fetch
            if (item.data && item.data.length > 50000) {
                return { ...item, data: null, isCachedPlaceholder: true };
            }
            return item;
        });

        try {
            localStorage.setItem('flowBoardItems', JSON.stringify(cacheItems));
        } catch (e) {
            console.warn("Local storage full or error", e);
        }
    }, [items]);

    // --- Actions ---

    const addItem = async (type, content = "", data = "", fileName = "") => {
        // Default center of current view
        const centerX = -offset.x + (window.innerWidth / 2 - 100) / scale;
        const centerY = -offset.y + (window.innerHeight / 2 - 50) / scale;

        const tempId = "temp-" + Date.now();
        const newItem = {
            _id: tempId,
            type,
            content,
            data,
            fileName,
            x: centerX,
            y: centerY,
            width: type === 'text' ? 200 : 300,
            height: type === 'text' ? 100 : 300,
            color: '#ffffff',
            zIndex: 1
        };

        // Optimistic Add
        setItems(prev => [...prev, newItem]);

        try {
            // Note: Backend extracts userId from token, so we don't need to send it
            const resp = await axiosInstance.post('/add-flow-item', newItem);
            if (resp.data && !resp.data.error) {
                // Replace temp item with real item from backend (which has real _id)
                setItems(prev => prev.map(i => i._id === tempId ? resp.data.flowItem : i));
                return resp.data.flowItem;
            } else {
                console.error("Server Error:", resp.data.message);
                alert("Failed to save item: " + resp.data.message);
                setItems(prev => prev.filter(i => i._id !== tempId));
            }
        } catch (err) {
            console.error("Error adding item:", err);
            alert("Error communicating with server. Check console.");
            setItems(prev => prev.filter(i => i._id !== tempId));
        }
    };

    const updateItem = async (id, updates) => {
        // Optimistic update
        setItems(prev => prev.map(item => item._id === id ? { ...item, ...updates } : item));

        // API Call (Debounced ideal, but direct for now)
        try {
            await axiosInstance.put(`/update-flow-item/${id}`, updates);
        } catch (err) {
            console.error("Error updating item", err);
        }
    };

    const deleteItem = async (id) => {
        // Instant delete (no confirm) for better UX
        try {
            setItems(prev => prev.filter(i => i._id !== id)); // Optimistic UI
            await axiosInstance.delete(`/delete-flow-item/${id}`);
        } catch (err) {
            console.error("Error deleting item", err);
            // Re-fetch or alert if needed
        }
    };

    // --- Helpers for Media/Doodle ---
    const fileInputRef = useRef(null);
    const [activeDoodleId, setActiveDoodleId] = useState(null);

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress to JPEG 80%
                };
            };
        });
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        for (const file of files) {
            if (file.type.startsWith('image/')) {
                // Compress image before adding
                const compressedData = await compressImage(file);
                addItem('image', "", compressedData);
            } else {
                // Handle other files normally
                const reader = new FileReader();
                reader.onload = (ev) => {
                    addItem('file', "", ev.target.result, file.name);
                };
                reader.readAsDataURL(file);
            }
        }
        e.target.value = null;
    };

    const onLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // --- Rendering Items ---

    const handleRotateStart = (e, item) => {
        e.stopPropagation();
        e.preventDefault();

        // Find the Rnd element (wrapper)
        const rndEl = document.getElementById(`rnd-${item._id}`);
        if (!rndEl) return;

        const rect = rndEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const onMove = (moveEvent) => {
            const dx = moveEvent.clientX - centerX;
            const dy = moveEvent.clientY - centerY;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            updateItem(item._id, { rotation: angle });
        };

        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    const renderItemContent = (item) => {
        switch (item.type) {
            case 'text': {
                const tapeColors = ['#FFadad', '#FFd6a5', '#FDffb6', '#CAffbf', '#9Bf6ff', '#A0c4ff', '#BDB2ff', '#FFc6ff'];
                const tapeColor = tapeColors[(item._id.charCodeAt(item._id.length - 1) || 0) % tapeColors.length];

                return (
                    <>
                        {/* Washi Tape */}
                        <div
                            className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 opacity-90 z-10 shadow-sm pointer-events-none"
                            style={{
                                backgroundColor: tapeColor,
                                transform: `translateX(-50%) rotate(${item._id.charCodeAt(0) % 5 - 2}deg)`,
                                clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0% 100%)' // Rough edges look
                            }}
                        ></div>
                        <textarea
                            className="w-full h-full resize-none bg-transparent outline-none p-4 pt-6 font-medium font-handwriting" // Added padding for tape + handwriting font
                            value={item.content}
                            style={{ color: '#16232a', fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' }}
                            onChange={(e) => updateItem(item._id, { content: e.target.value })}
                            placeholder="Type here..."
                            onMouseDown={(e) => e.stopPropagation()}
                        />
                    </>
                );
            }
            case 'file':
                const isPdf = item.data && item.data.startsWith('data:application/pdf');
                if (isPdf) {
                    return (
                        <div className="w-full h-full overflow-hidden bg-white">
                            <iframe
                                src={item.data}
                                className="w-full h-full"
                                title={item.fileName || "PDF Viewer"}
                            />
                        </div>
                    );
                }
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-200 rounded overflow-hidden">
                        <MdAttachFile size={32} className="text-gray-500" />
                        <span className="text-xs font-medium text-center mt-2 text-gray-700 w-full truncate">{item.fileName || "File"}</span>
                        <a href={item.data} download={item.fileName || "download"} className="mt-1 text-[10px] text-blue-500 hover:underline" onMouseDown={e => e.stopPropagation()}>Download</a>
                    </div>
                );
            case 'image':
                if (item.isCachedPlaceholder && !item.data) {
                    return <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-xs animate-pulse">Loading Image...</div>;
                }
                return (
                    <div className="w-full h-full flex items-center justify-center overflow-hidden cursor-move">
                        {item.data ? (
                            <img src={item.data} alt="uploaded" className="w-full h-full object-contain" draggable={false} />
                        ) : (
                            <div className="text-gray-400 text-sm">No Image</div>
                        )}
                    </div>
                );
            case 'doodle':
                if (activeDoodleId === item._id) {
                    return <DoodleCanvas
                        initialData={item.data}
                        width={item.width}
                        height={item.height}
                        onSave={(data) => {
                            updateItem(item._id, { data });
                            setActiveDoodleId(null);
                        }}
                        onCancel={() => {
                            if (!item.data) deleteItem(item._id);
                            setActiveDoodleId(null);
                        }}
                    />;
                }
                return (
                    <div className="w-full h-full cursor-move group" onDoubleClick={() => setActiveDoodleId(item._id)}>
                        {item.data ? (
                            <img src={item.data} className="w-full h-full object-contain" draggable={false} />
                        ) : (
                            <div className="w-full h-full bg-white/50 flex items-center justify-center text-xs text-gray-500 border-2 border-dashed border-gray-300 rounded hover:border-[#ff5b04] transition-colors">
                                Double click to draw
                            </div>
                        )}
                    </div>
                );
            default:
                return <div className="p-2">Unknown Type</div>;
        }
    };

    // --- Canvas Interaction ---
    const handleWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            const newScale = Math.min(Math.max(0.5, scale + delta), 3);
            setScale(newScale);
        } else {
            // Pan
            setOffset(prev => ({
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#e4eef0]">
            <Navbar userInfo={userInfo} onLogout={onLogout} />

            {/* Toolbar */}
            <div className="absolute top-24 left-6 z-50 bg-white p-2 rounded-2xl shadow-xl flex flex-col gap-3 items-center border border-[#075056]/20">
                <button onClick={() => addItem('text')} className="p-2 hover:bg-[#e4eef0] rounded-lg text-[#075056] text-xl" title="Add Note">
                    <MdTextFields />
                </button>
                <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-[#e4eef0] rounded-lg text-[#075056] text-xl" title="Add Image">
                    <MdImage />
                </button>
                <button onClick={() => addItem('doodle')} className="p-2 hover:bg-[#e4eef0] rounded-lg text-[#075056] text-xl" title="Add Doodle">
                    <MdBrush />
                </button>
                <div className="h-px w-full bg-gray-200 my-1"></div>
                <button onClick={() => setScale(s => Math.min(s + 0.1, 3))} className="p-2 hover:bg-[#e4eef0] rounded-lg text-[#16232a]" title="Zoom In"><MdZoomIn /></button>
                <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="p-2 hover:bg-[#e4eef0] rounded-lg text-[#16232a]" title="Zoom Out"><MdZoomOut /></button>
            </div>

            {/* Infinite Canvas */}
            <div
                className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden"
                onWheel={handleWheel}
                style={{
                    backgroundImage: 'linear-gradient(#cfd8dc 1px, transparent 1px), linear-gradient(90deg, #cfd8dc 1px, transparent 1px)',
                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                    backgroundPosition: `${offset.x}px ${offset.y}px`
                }}
            >
                <div
                    className="absolute top-0 left-0 w-full h-full origin-top-left"
                    style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
                >
                    {items.map(item => (
                        <Rnd
                            key={item._id}
                            scale={scale} // CRITICAL FIX FOR MOVE OPTION
                            disableDragging={activeDoodleId === item._id}
                            enableResizing={activeDoodleId !== item._id}
                            size={{ width: item.width, height: item.height }}
                            position={{ x: item.x, y: item.y }}
                            onDragStop={(e, d) => {
                                updateItem(item._id, { x: d.x, y: d.y });
                            }}
                            onResizeStop={(e, direction, ref, delta, position) => {
                                updateItem(item._id, {
                                    width: ref.style.width,
                                    height: ref.style.height,
                                    ...position
                                });
                            }}
                            bounds="parent" // Or remove bounds for infinite
                            style={{ zIndex: item.zIndex }}
                            className="group"
                            id={`rnd-${item._id}`}
                        >
                            <div
                                className={`w-full h-full flex flex-col pointer-events-auto relative transition-colors border border-transparent hover:border-[#ff5b04] ${['image', 'doodle'].includes(item.type) ? 'bg-transparent' : 'bg-white shadow-lg rounded-lg'}`}
                                style={{ transform: `rotate(${item.rotation || 0}deg)` }}
                            >
                                {/* Drag Handle - Hide for media for cleaner look */}
                                {!['image', 'doodle'].includes(item.type) && (
                                    <div className="h-4 w-full bg-gray-50 rounded-t-lg cursor-move flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
                                    </div>
                                )}

                                {/* Rotate Handle */}
                                <div
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center bg-white shadow rounded-full cursor-alias opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-gray-50 text-gray-600"
                                    onMouseDown={(e) => handleRotateStart(e, item)}
                                    title="Rotate"
                                >
                                    <MdRotateRight size={20} />
                                </div>

                                {/* Content */}
                                <div className={`flex-1 ${item.type === 'doodle' ? 'overflow-visible' : 'overflow-hidden'}`}>
                                    {renderItemContent(item)}
                                </div>

                                {/* Controls (Delete) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteItem(item._id);
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="absolute -top-6 -right-6 w-8 h-8 bg-white text-red-500 border border-gray-200 rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-md hover:bg-red-50 hover:scale-110 transition-all duration-200 z-[100] flex items-center justify-center cursor-pointer pointer-events-auto"
                                    title="Delete"
                                >
                                    <MdDelete size={20} />
                                </button>
                            </div>


                        </Rnd>
                    ))}
                </div>
            </div>
            {/* Hidden Input for Images */}
            <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="*"
                multiple
            />
        </div>
    );
};

const DoodleCanvas = ({ initialData, onSave, onCancel, width, height }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [tool, setTool] = useState("brush"); // 'brush' or 'eraser'
    const [brushSize, setBrushSize] = useState(3);

    // History for Undo/Redo
    const [history, setHistory] = useState([]);
    const [step, setStep] = useState(-1);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = parseInt(width) || 300;
        canvas.height = parseInt(height) || 300;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (initialData) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                saveState(); // Save initial loaded state
            };
            img.src = initialData;
        } else {
            saveState(); // Save blank state
        }
    }, []);

    // Apply tool settings
    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 20;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = color;
        }
    }, [tool, color, brushSize]);

    const saveState = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Get full imageData
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Truncate future history if we draw new stuff
        const newHistory = history.slice(0, step + 1);
        newHistory.push(data);
        setHistory(newHistory);
        setStep(newHistory.length - 1);
    };

    const undo = () => {
        if (step > 0) {
            const newStep = step - 1;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(history[newStep], 0, 0);
            setStep(newStep);
        }
    };

    const redo = () => {
        if (step < history.length - 1) {
            const newStep = step + 1;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(history[newStep], 0, 0);
            setStep(newStep);
        }
    };

    const start = (e) => {
        setIsDrawing(true);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        const { offsetX, offsetY } = e.nativeEvent;
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stop = () => {
        if (isDrawing) {
            setIsDrawing(false);
            const ctx = canvasRef.current.getContext('2d');
            ctx.closePath();
            saveState(); // Save snap on mouse up
        }
    };

    return (
        <div className="w-full h-full relative" onMouseDown={(e) => e.stopPropagation()}>
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair bg-white/50 border border-dashed border-gray-400"
                onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
            />

            {/* Extended Toolbar */}
            <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 bg-white shadow-xl p-2 rounded-xl flex gap-2 border items-center z-50 min-w-[300px] justify-center">
                {/* Tools */}
                <button onClick={() => setTool('brush')} className={`p-1 rounded ${tool === 'brush' ? 'bg-[#e4eef0] text-[#ff5b04]' : 'text-gray-600'}`} title="Brush">
                    <MdEdit size={20} />
                </button>
                <button onClick={() => setTool('eraser')} className={`p-1 rounded ${tool === 'eraser' ? 'bg-[#e4eef0] text-[#ff5b04]' : 'text-gray-600'}`} title="Eraser">
                    <MdCleaningServices size={20} />
                </button>

                <div className="w-px h-6 bg-gray-200 mx-1"></div>

                {/* Color */}
                <input
                    type="color"
                    value={color}
                    onChange={e => { setColor(e.target.value); setTool('brush'); }}
                    className="w-6 h-6 rounded-full overflow-hidden border-0 cursor-pointer"
                    title="Brush Color"
                />

                <div className="w-px h-6 bg-gray-200 mx-1"></div>

                {/* Undo/Redo */}
                <button onClick={undo} disabled={step <= 0} className="p-1 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 rounded" title="Undo">
                    <MdUndo size={20} />
                </button>
                <button onClick={redo} disabled={step >= history.length - 1} className="p-1 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 rounded" title="Redo">
                    <MdRedo size={20} />
                </button>

                <div className="w-px h-6 bg-gray-200 mx-1"></div>

                {/* Actions */}
                <button onClick={onCancel} className="text-xs px-3 py-1 hover:bg-red-50 text-red-500 rounded font-medium">Cancel</button>
                <button onClick={() => onSave(canvasRef.current.toDataURL())} className="text-xs px-3 py-1 bg-[#ff5b04] text-white rounded font-bold hover:bg-[#e04a00]">Done</button>
            </div>
        </div>
    );
};

export default FlowBoard;
