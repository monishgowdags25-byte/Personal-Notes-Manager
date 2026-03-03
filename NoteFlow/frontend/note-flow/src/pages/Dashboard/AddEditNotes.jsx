import React, { useState, useRef, useEffect } from "react";
import TagInput from "../../components/Input/TagInput";
import {
    MdClose,
    MdDraw,
    MdAttachFile,
    MdMic,
    MdMicOff,
    MdImage,
    MdAudiotrack,
    MdPause,
    MdUndo,
    MdRedo,
    MdBrush,
    MdHorizontalRule,
    MdCheckBoxOutlineBlank,
    MdAdd,
    MdArrowDropDown,
    MdMoreVert,
    MdDownload,
    MdEdit,
    MdSpeed
} from "react-icons/md";
import axiosInstance from "../../utils/axiosInstance";

// Custom Eraser Icon Component
const EraserIcon = ({ size = 20, color = "#16232a" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M16 5L20 9L12 17L8 13L16 5Z" fill={color} opacity="0.3" />
        <path d="M16 5L20 9L12 17L8 13L16 5Z" stroke={color} />
        <path d="M8 13L6 15" stroke={color} />
        <path d="M12 17L10 19" stroke={color} />
    </svg>
);

// Triangle Icon Component
const TriangleIcon = ({ size = 20, color = "#16232a" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 3L20 21L4 21Z" />
    </svg>
);

// Circle Icon Component
const CircleIcon = ({ size = 20, color = "#16232a" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="9" />
    </svg>
);

const AddEditNotes = ({ noteData, type, getAllNotes, onClose, showToastMessage, folders = [], onCreateFolder }) => {
    const [title, setTitle] = useState(noteData?.title || "");
    const [content, setContent] = useState(noteData?.content || "");
    const [tags, setTags] = useState(noteData?.tags || []);

    // New states for priority, folder, and color
    const [priority, setPriority] = useState(noteData?.priority || "medium");
    const [folderId, setFolderId] = useState(noteData?.folderId || 1);
    const [noteColor, setNoteColor] = useState(noteData?.color || "#ff5b04");

    // Attachment states
    const [doodle, setDoodle] = useState(noteData?.doodle || "");
    const [mediaAttachments, setMediaAttachments] = useState(noteData?.mediaAttachments || []);
    const [voiceAttachments, setVoiceAttachments] = useState(noteData?.voiceAttachments || []);
    const [fileAttachments, setFileAttachments] = useState(noteData?.fileAttachments || []);

    // Voice transcription states
    const [voiceTranscriptions, setVoiceTranscriptions] = useState(noteData?.voiceTranscriptions || []);
    const [currentTranscription, setCurrentTranscription] = useState("");
    const [interimTranscription, setInterimTranscription] = useState(""); // Separate interim text
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionMode, setTranscriptionMode] = useState(false); // New: separate transcription mode
    const recognitionRef = useRef(null);

    // Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedBlob, setRecordedBlob] = useState(null);

    // Dropdown menu state
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

    // Voice dropdown state
    const [openVoiceDropdown, setOpenVoiceDropdown] = useState(null);

    // Playing audio state
    const [playingAudio, setPlayingAudio] = useState(null);

    // Voice memo names state
    const [voiceMemoNames, setVoiceMemoNames] = useState(() => {
        // Initialize with default names based on voiceAttachments
        return voiceAttachments.map((_, index) => `Voice Memo ${index + 1}`);
    });

    // Playback speed submenu state
    const [showPlaybackSpeedMenu, setShowPlaybackSpeedMenu] = useState(null);

    // Priority and folder dropdown states
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
    const [showFolderDropdown, setShowFolderDropdown] = useState(false);

    const [error, setError] = useState(null);

    // Doodle states
    const [showDoodlePanel, setShowDoodlePanel] = useState(false);
    const [selectedTool, setSelectedTool] = useState('pen');
    const [penType, setPenType] = useState('pen'); // pen, pencil, highlighter
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [historyIndex, setHistoryIndex] = useState(-1); // Track history index for UI updates
    const [historyLength, setHistoryLength] = useState(0); // Track history length for UI updates

    // Refs for doodle canvas
    const canvasRef = useRef(null);

    // Sync state if noteData is updated from outside (e.g. background fetch)
    useEffect(() => {
        if (type === "edit" && noteData && !noteData.isDetailLoading) {
            // Only update if current state matches the initial summary (empty data)
            // and incoming has actual data
            if (mediaAttachments.length === 0 && noteData.attachments?.length > 0) {
                setMediaAttachments(noteData.attachments);
            }
            if (fileAttachments.length === 0 && noteData.fileAttachments?.length > 0) {
                setFileAttachments(noteData.fileAttachments);
            }
            if (voiceAttachments.length === 0 && noteData.voiceMemos?.length > 0) {
                setVoiceAttachments(noteData.voiceMemos);
                setVoiceMemoNames(noteData.voiceMemos.map((_, index) => `Voice Memo ${index + 1}`));
            }
            if (!doodle && noteData.doodles?.[0]) {
                setDoodle(noteData.doodles[0]);
                if (showDoodlePanel) initDoodleCanvas();
            }
        }
    }, [noteData?.isDetailLoading, noteData?.id, type]);
    const isDrawing = useRef(false);
    const historyRef = useRef([]); // This should start as an empty array
    const historyIndexRef = useRef(-1); // This should start at -1
    const startPointRef = useRef({ x: 0, y: 0 });

    // Initialize doodle canvas
    useEffect(() => {
        if (showDoodlePanel) {
            initDoodleCanvas();
        }
    }, [showDoodlePanel]);

    const initDoodleCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            // Ensure white background in all cases
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = brushColor;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Clear history and initialize with blank white canvas
            historyRef.current = [];
            historyIndexRef.current = -1;
            setHistoryIndex(-1);
            setHistoryLength(0);

            // Initialize history with blank white canvas
            saveCanvasState();

            // If editing and doodle exists, load it
            if (type === "edit" && noteData?.doodle) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    saveCanvasState();
                };
                img.src = noteData.doodle;
            }
        }
    };

    // Save canvas state for undo/redo
    const saveCanvasState = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            // Remove any future states if we're not at the end of history
            if (historyIndexRef.current < historyRef.current.length - 1) {
                historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
            }

            // Add current state to history
            const dataUrl = canvas.toDataURL();
            historyRef.current.push(dataUrl);
            historyIndexRef.current = historyRef.current.length - 1;

            // Update state for UI re-rendering
            setHistoryIndex(historyIndexRef.current);
            setHistoryLength(historyRef.current.length);

            // Preload the image for faster synchronous restore later
            preloadImage(dataUrl);
        }
    };

    // Undo action
    const undo = () => {
        console.log("Undo called:", historyIndexRef.current, historyRef.current.length);
        if (historyIndexRef.current > 0) {
            historyIndexRef.current--;
            console.log("Restoring state:", historyIndexRef.current);
            restoreCanvasState(historyRef.current[historyIndexRef.current]);

            // Update state for UI re-rendering
            setHistoryIndex(historyIndexRef.current);
            console.log("After undo, index:", historyIndexRef.current, "history length:", historyRef.current.length);
        } else {
            console.log("Cannot undo: already at initial state");
        }
    };

    // Redo action
    const redo = () => {
        console.log("Redo called:", historyIndexRef.current, historyRef.current.length);
        console.log("History:", historyRef.current);
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current++;
            console.log("Restoring state:", historyIndexRef.current);
            restoreCanvasState(historyRef.current[historyIndexRef.current]);

            // Update state for UI re-rendering
            setHistoryIndex(historyIndexRef.current);
            console.log("After redo, index:", historyIndexRef.current, "history length:", historyRef.current.length);
        } else {
            console.log("Cannot redo: already at latest state");
        }
    };

    // Cache for preloaded images to avoid async issues during drawing
    const imageCacheRef = useRef({});

    // Preload image and cache it
    const preloadImage = (dataUrl) => {
        return new Promise((resolve) => {
            if (imageCacheRef.current[dataUrl]) {
                resolve(imageCacheRef.current[dataUrl]);
                return;
            }

            const img = new Image();
            img.onload = () => {
                imageCacheRef.current[dataUrl] = img;
                resolve(img);
            };
            img.src = dataUrl;
        });
    };

    // Restore canvas state synchronously using preloaded image
    const restoreCanvasState = (dataUrl) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Use cached image if available
        if (imageCacheRef.current[dataUrl]) {
            ctx.drawImage(imageCacheRef.current[dataUrl], 0, 0);
        } else {
            // Fallback: create image and draw (may cause slight delay but preserves functionality)
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
            };
            img.src = dataUrl;
        }
    };

    // Restore canvas state synchronously for immediate drawing
    const restoreCanvasStateSync = (dataUrl) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Use cached image if available
        if (imageCacheRef.current[dataUrl]) {
            ctx.drawImage(imageCacheRef.current[dataUrl], 0, 0);
            return true; // Successfully restored
        }
        return false; // Could not restore synchronously
    };

    // Set brush properties based on pen type
    const setBrushProperties = (ctx) => {
        ctx.strokeStyle = brushColor;
        ctx.fillStyle = brushColor; // Add fill style for pencil dots
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        switch (penType) {
            case 'pencil':
                ctx.lineWidth = brushSize;
                ctx.globalAlpha = 1.0;
                // Create a micro-dotted pencil effect
                ctx.shadowBlur = 0.2;
                ctx.shadowColor = brushColor;
                ctx.lineCap = 'round';
                break;
            case 'highlighter':
                ctx.lineWidth = brushSize * 3;
                ctx.globalAlpha = 0.05; // 5% transparency (95% opacity)
                ctx.lineCap = 'butt';
                break;
            default: // pen
                ctx.lineWidth = brushSize;
                ctx.globalAlpha = 1.0;
                ctx.shadowBlur = 0;
                ctx.lineCap = 'round';
                break;
        }
    };

    // Drawing functions for doodle
    const startDrawing = (e) => {
        isDrawing.current = true;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Store starting point for shapes
        startPointRef.current = { x, y };

        if (selectedTool === 'pen') {
            setBrushProperties(ctx);
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (selectedTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = brushSize * 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
        // For shape tools, we just need to store the starting point
        // The drawing will happen in the draw function
    };

    const draw = (e) => {
        if (!isDrawing.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (selectedTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = brushSize * 2;
            ctx.lineCap = 'round';
            ctx.lineTo(x, y);
            ctx.stroke();
            // Update the last position for continuous erasing
            startPointRef.current = { x, y };
        } else if (selectedTool === 'pen') {
            ctx.globalCompositeOperation = 'source-over';
            setBrushProperties(ctx);

            // For pencil, add texture effect
            if (penType === 'pencil') {
                // Create a micro-dotted but continuous effect
                const lastX = canvas.lastX || startPointRef.current.x;
                const lastY = canvas.lastY || startPointRef.current.y;
                const deltaX = x - lastX;
                const deltaY = y - lastY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                // Create micro-dots along the path for a realistic pencil effect
                if (distance > 0.5) {
                    // Increase density for micro-dots
                    const segments = Math.max(1, Math.floor(distance / 0.8));
                    ctx.beginPath(); // Start a new path for dotted drawing

                    // Draw micro-dots along the path
                    for (let i = 0; i <= segments; i++) {
                        const t = i / segments;
                        const dotX = lastX + deltaX * t;
                        const dotY = lastY + deltaY * t;

                        // Draw a small dot at each position
                        ctx.moveTo(dotX, dotY);
                        ctx.arc(dotX, dotY, brushSize * 0.3, 0, Math.PI * 2);
                    }
                    ctx.fill(); // Use fill instead of stroke for dots
                }
                // Store current position for next iteration
                canvas.lastX = x;
                canvas.lastY = y;
            } else {
                // For regular pen and highlighter, draw normally
                ctx.lineTo(x, y);
                ctx.stroke();

                // Store current position for next iteration
                canvas.lastX = x;
                canvas.lastY = y;
            }

            // Reset line width and other properties to default values
            ctx.lineWidth = brushSize;
        } else if (selectedTool === 'line') {
            // For shape tools, we need to restore the canvas to the last saved state
            // and then draw the shape on top as a preview
            restoreCanvasStateSync(historyRef.current[historyIndexRef.current]);

            // Draw the line as a preview
            const ctx = canvasRef.current.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';
            setBrushProperties(ctx);
            ctx.beginPath();
            ctx.moveTo(startPointRef.current.x, startPointRef.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (selectedTool === 'square') {
            // For shape tools, we need to restore the canvas to the last saved state
            // and then draw the shape on top as a preview
            restoreCanvasStateSync(historyRef.current[historyIndexRef.current]);

            // Draw the square/rectangle as a preview
            const ctx = canvasRef.current.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';
            setBrushProperties(ctx);
            const width = x - startPointRef.current.x;
            const height = y - startPointRef.current.y;
            ctx.strokeRect(startPointRef.current.x, startPointRef.current.y, width, height);
        } else if (selectedTool === 'circle') {
            // For shape tools, we need to restore the canvas to the last saved state
            // and then draw the shape on top as a preview
            restoreCanvasStateSync(historyRef.current[historyIndexRef.current]);

            // Draw the circle as a preview
            const ctx = canvasRef.current.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';
            setBrushProperties(ctx);
            const centerX = startPointRef.current.x;
            const centerY = startPointRef.current.y;
            const radius = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (selectedTool === 'triangle') {
            // For shape tools, we need to restore the canvas to the last saved state
            // and then draw the shape on top as a preview
            restoreCanvasStateSync(historyRef.current[historyIndexRef.current]);

            // Draw the triangle as a preview
            const ctx = canvasRef.current.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';
            setBrushProperties(ctx);
            ctx.beginPath();

            // Simple triangle: start point is top vertex, current point helps determine base
            const x1 = startPointRef.current.x;
            const y1 = startPointRef.current.y;
            const x2 = x;
            const y2 = y;

            // Calculate base of triangle perpendicular to the line from start to current point
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);

            if (length > 0) {
                // Normalize direction vector
                const nx = dx / length;
                const ny = dy / length;

                // Perpendicular vector (rotated 90 degrees)
                const perpX = -ny;
                const perpY = nx;

                // Base width (20% of length)
                const baseWidth = length * 0.2;

                // Base center point (70% along the line from start to current)
                const baseCenterX = x1 + dx * 0.7;
                const baseCenterY = y1 + dy * 0.7;

                // Base vertices
                const baseX1 = baseCenterX + perpX * baseWidth;
                const baseY1 = baseCenterY + perpY * baseWidth;
                const baseX2 = baseCenterX - perpX * baseWidth;
                const baseY2 = baseCenterY - perpY * baseWidth;

                // Draw triangle
                ctx.moveTo(x1, y1);  // Top vertex
                ctx.lineTo(baseX1, baseY1);  // Base vertex 1
                ctx.lineTo(baseX2, baseY2);  // Base vertex 2
                ctx.closePath();
                ctx.stroke();
            }
        }
    };

    const stopDrawing = () => {
        if (isDrawing.current) {
            isDrawing.current = false;

            // For shape tools, we need to save the final state after drawing is complete
            if (selectedTool !== 'pen' && selectedTool !== 'eraser') {
                // Save state for shape tools when drawing is complete
                saveCanvasState();
            } else {
                // Save state for pen and eraser tools
                saveCanvasState();
            }

            // Reset stored positions
            const canvas = canvasRef.current;
            delete canvas.lastX;
            delete canvas.lastY;
        }
    };

    const saveDoodle = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            setDoodle(dataUrl);
            setShowDoodlePanel(false);
        }
    };

    const clearDoodle = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveCanvasState();
        }
    };

    // Media attachment handler
    const handleMediaAttachment = async (e) => {
        const files = Array.from(e.target.files);

        const newMediaItems = [];
        const newFileItems = [];

        const readPromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const attachmentData = {
                        data: event.target.result,
                        name: file.name,
                        type: file.type
                    };

                    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                        // Media (Images/Videos) stored as objects to preserve name
                        newMediaItems.push(attachmentData);
                    } else {
                        // Files (PDFs, Docs) stored as objects
                        newFileItems.push(attachmentData);
                    }
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        });

        try {
            await Promise.all(readPromises);

            if (newMediaItems.length > 0) {
                setMediaAttachments(prev => [...prev, ...newMediaItems]);
            }

            if (newFileItems.length > 0) {
                setFileAttachments(prev => [...prev, ...newFileItems]);
            }
        } catch (error) {
            console.error("Error reading files:", error);
            showToastMessage("Failed to process some files");
        }

        // Reset the input value to allow selecting the same file again
        e.target.value = '';
    };

    // Voice recording and transcription functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);

            const chunks = [];
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result;
                    setVoiceAttachments(prev => [...prev, base64data]);
                };

                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error(err);
            setError("Microphone access denied. Please allow microphone access to record voice notes.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    // Voice transcription functions (separate from recording)
    const startTranscription = () => {
        console.log('Starting voice transcription...');

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            const errorMsg = 'Speech recognition not supported in this browser. Please use Chrome or Edge.';
            console.error(errorMsg);
            setError(errorMsg);
            alert(errorMsg);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('Speech recognition started');
            setIsTranscribing(true);
            setTranscriptionMode(true);
            setCurrentTranscription("");
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                    console.log('Final transcript:', transcript);
                } else {
                    interimTranscript += transcript;
                    console.log('Interim transcript:', transcript);
                }
            }

            // Only add final results to current transcription
            if (finalTranscript) {
                setCurrentTranscription(prev => {
                    const newTranscript = (prev + ' ' + finalTranscript).trim();
                    console.log('Updated final transcription:', newTranscript);
                    return newTranscript;
                });
            }

            // Store interim separately for display only
            setInterimTranscription(interimTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone access in your browser settings.');
            }
            if (event.error !== 'no-speech') {
                setIsTranscribing(false);
            }
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            setIsTranscribing(false);
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
            console.log('Recognition started successfully');
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setError('Failed to start speech recognition. Please try again.');
            alert('Failed to start speech recognition: ' + err.message);
        }
    };

    const stopTranscription = () => {
        // Combine final and any remaining interim text
        const fullTranscription = (currentTranscription + ' ' + interimTranscription).trim();
        console.log('Stopping transcription. Final text:', fullTranscription);

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            } catch (err) {
                console.error('Error stopping speech recognition:', err);
            }
        }

        // Add transcription to note content immediately (without emoji)
        if (fullTranscription) {
            console.log('Inserting transcription into content:', fullTranscription);
            setVoiceTranscriptions(prev => [...prev, fullTranscription]);

            // Insert text into content without emoji
            const separator = content.trim() ? "\n\n" : "";
            const newContent = content + separator + fullTranscription;
            setContent(newContent);
            console.log('New content:', newContent);
        } else {
            console.warn('No transcription to insert');
        }

        setIsTranscribing(false);
        setTranscriptionMode(false);
        setCurrentTranscription("");
        setInterimTranscription("");
    };

    // Remove attachments
    const removeMediaAttachment = (index) => {
        const newAttachments = [...mediaAttachments];
        newAttachments.splice(index, 1);
        setMediaAttachments(newAttachments);
    };

    const removeVoiceAttachment = (index) => {
        const newAttachments = [...voiceAttachments];
        newAttachments.splice(index, 1);
        setVoiceAttachments(newAttachments);
    };

    const removeFileAttachment = (index) => {
        const newAttachments = [...fileAttachments];
        newAttachments.splice(index, 1);
        setFileAttachments(newAttachments);
    };

    const removeDoodle = () => {
        setDoodle("");
    };

    // Helper to prepare attachments
    const prepareAttachments = (attachments) => {
        return attachments.map(attachment => {
            if (attachment && typeof attachment === 'object' && attachment.data) {
                return attachment.data;
            }
            return attachment;
        });
    };

    // Add Note
    const addNewNote = async () => {
        try {
            const preparedMediaAttachments = prepareAttachments(mediaAttachments);
            const preparedFileAttachments = prepareAttachments(fileAttachments);

            const response = await axiosInstance.post("/add-note", {
                title,
                content,
                tags,
                priority,
                folderId,
                color: noteColor,
                doodle,
                mediaAttachments: preparedMediaAttachments,
                voiceAttachments,
                fileAttachments: preparedFileAttachments
            });

            if (response.data && response.data.note) {
                showToastMessage("Note Added Successfully");
                getAllNotes();
                onClose();
            }

        } catch (error) {
            console.error("Error creating note:", error);
            setError(error.response?.data?.message || "Failed to create note. Please try again.");
        }
    };

    // Edit Note
    const editNote = async () => {
        const noteId = noteData._id
        try {
            const preparedMediaAttachments = prepareAttachments(mediaAttachments);
            const preparedFileAttachments = prepareAttachments(fileAttachments);

            const response = await axiosInstance.put("/edit-note/" + noteId, {
                title,
                content,
                tags,
                priority,
                folderId,
                color: noteColor,
                doodle,
                mediaAttachments: preparedMediaAttachments,
                voiceAttachments,
                fileAttachments: preparedFileAttachments
            });

            if (response.data && response.data.note) {
                showToastMessage("Note Edited Successfully");
                getAllNotes();
                onClose();
            }

        } catch (error) {
            console.error("Error editing note:", error);
            setError(error.response?.data?.message || "Failed to edit note. Please try again.");
        }
    };



    const handleAddNote = () => {
        if (!title) {
            setError("Please enter the title");
            return;
        }

        if (!content) {
            setError("Please enter the content");
            return;
        }

        setError("");

        if (type === "edit") {
            editNote()
        } else {
            addNewNote()
        }
    };

    // Color options for notes - using consistent colors with the rest of the app
    const colorOptions = [
        { name: "Default", value: "#e4eef0" },
        { name: "Light Blue", value: "#d1ecf1" },
        { name: "Light Green", value: "#d4edda" },
        { name: "Light Yellow", value: "#fff3cd" },
        { name: "Light Red", value: "#f8d7da" },
        { name: "Light Purple", value: "#e2d1f0" },
    ];

    // Effect to update voice memo names when voiceAttachments change
    useEffect(() => {
        setVoiceMemoNames(prevNames => {
            // If we have fewer names than attachments, add default names
            if (prevNames.length < voiceAttachments.length) {
                const newNames = [...prevNames];
                for (let i = prevNames.length; i < voiceAttachments.length; i++) {
                    newNames.push(`Voice Memo ${i + 1}`);
                }
                return newNames;
            }
            // If we have more names than attachments, trim the array
            else if (prevNames.length > voiceAttachments.length) {
                return prevNames.slice(0, voiceAttachments.length);
            }
            // Otherwise, keep the current names
            return prevNames;
        });
    }, [voiceAttachments]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close custom dropdowns
            if (showPriorityDropdown || showFolderDropdown) {
                // Check if click is outside the custom dropdowns
                const priorityDropdown = document.querySelector('.priority-dropdown');
                const folderDropdown = document.querySelector('.folder-dropdown');

                if (priorityDropdown && !priorityDropdown.contains(event.target)) {
                    setShowPriorityDropdown(false);
                }

                if (folderDropdown && !folderDropdown.contains(event.target)) {
                    setShowFolderDropdown(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPriorityDropdown, showFolderDropdown]);

    return (
        <div className="relative p-4 bg-white rounded-lg shadow-lg max-h-[85vh] w-full">
            <button
                className="w-8 h-8 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-300 transition-all shadow-lg z-50"
                onClick={onClose}
                style={{ backgroundColor: "#ff5b04" }}
            >
                <MdClose className="text-lg" style={{ color: "#e4eef0" }} />
            </button>

            <div className="flex flex-col gap-2">
                <label className="font-medium text-sm" style={{ color: "#075056" }}>TITLE</label>
                <input
                    type="text"
                    className="text-lg outline-none px-2 py-2 rounded-lg border transition-all focus:ring-2 focus:ring-blue-300 w-full"
                    style={{ backgroundColor: "#ffffff", borderColor: "#16232a", color: "#16232a" }}
                    placeholder="Note Title"
                    value={title}
                    onChange={({ target }) => setTitle(target.value)}
                />
            </div>

            <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-sm" style={{ color: "#075056" }}>CONTENT</label>
                    <button
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${transcriptionMode ? 'bg-[#ff5b04] text-white animate-pulse' : 'bg-[#075056] text-white hover:opacity-90'}`}
                        onClick={() => {
                            transcriptionMode ? stopTranscription() : startTranscription();
                        }}
                        title={transcriptionMode ? "Stop transcribing and insert text" : "Start voice-to-text transcription"}
                    >
                        {transcriptionMode ? (
                            <>
                                <MdMicOff size={16} />
                                <span>Stop Transcribing</span>
                            </>
                        ) : (
                            <>
                                <MdAudiotrack size={16} />
                                <span>Voice-to-Text</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Live Transcription Preview */}
                {transcriptionMode && currentTranscription && (
                    <div
                        className="p-2 rounded-lg text-xs mb-2"
                        style={{
                            backgroundColor: "rgba(255, 91, 4, 0.1)",
                            border: "1px solid rgba(255, 91, 4, 0.3)",
                            color: "#16232a"
                        }}
                    >
                        <div className="flex items-center mb-1">
                            <MdMic className="text-[#ff5b04] mr-1 animate-pulse" size={14} />
                            <span className="font-medium text-[#ff5b04]">Live Transcription:</span>
                        </div>
                        <p className="italic">{currentTranscription}</p>
                    </div>
                )}

                <textarea
                    type="text"
                    className="text-sm outline-none px-2 py-2 rounded-lg border transition-all focus:ring-2 focus:ring-blue-300 w-full resize-none"
                    style={{ backgroundColor: "#ffffff", borderColor: "#16232a", color: "#16232a" }}
                    placeholder="Note Content"
                    rows={10}
                    value={content}
                    onChange={({ target }) => setContent(target.value)}
                />
            </div>

            {/* Priority, Folder, and Color Section - Side by side */}
            <div className="flex flex-wrap gap-3 mt-3">
                {/* Priority Selection - Custom Dropdown */}
                <div className="flex-1 min-w-[120px] relative priority-dropdown">
                    <label className="font-medium text-sm block mb-1" style={{ color: "#075056" }}>PRIORITY</label>
                    <div
                        className="w-full p-1.5 rounded-lg border transition-all text-sm flex items-center justify-between cursor-pointer"
                        style={{ backgroundColor: "#ffffff", borderColor: "#075056", color: "#075056" }}
                        onClick={() => {
                            // Close other dropdowns
                            setShowFolderDropdown(false);
                            setShowAttachmentMenu(false);
                            setOpenVoiceDropdown(null);
                            // Toggle priority dropdown
                            setShowPriorityDropdown(!showPriorityDropdown);
                        }}
                    >
                        <span>
                            {priority === 'low' && 'Low'}
                            {priority === 'medium' && 'Medium'}
                            {priority === 'high' && 'High'}
                            {priority === 'urgent' && 'Urgent'}
                        </span>
                        <MdArrowDropDown className={`transition-transform ${showPriorityDropdown ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Priority Dropdown Menu */}
                    {showPriorityDropdown && (
                        <div
                            className="absolute z-10 mt-1 rounded-lg shadow-lg w-full"
                            style={{ backgroundColor: "#ffffff", border: "1px solid #075056" }}
                        >
                            {['low', 'medium', 'high', 'urgent'].map((priorityOption) => (
                                <div
                                    key={priorityOption}
                                    className="flex items-center w-full px-3 py-2 text-left hover:bg-[#075056] transition-all text-sm cursor-pointer"
                                    style={{ color: "#075056" }}
                                    onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                                    onMouseLeave={(e) => e.target.style.color = "#075056"}
                                    onClick={() => {
                                        setPriority(priorityOption);
                                        setShowPriorityDropdown(false);
                                    }}
                                >
                                    {priorityOption.charAt(0).toUpperCase() + priorityOption.slice(1)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Folder Selection - Custom Dropdown */}
                <div className="flex-1 min-w-[120px] relative folder-dropdown">
                    <label className="font-medium text-sm block mb-1" style={{ color: "#075056" }}>FOLDER</label>
                    <div
                        className="flex items-center gap-1.5"
                    >
                        <div
                            className="flex-1 p-1.5 rounded-lg border transition-all text-sm flex items-center justify-between cursor-pointer"
                            style={{ backgroundColor: "#ffffff", borderColor: "#075056", color: "#075056" }}
                            onClick={() => {
                                // Close other dropdowns
                                setShowPriorityDropdown(false);
                                setShowAttachmentMenu(false);
                                setOpenVoiceDropdown(null);
                                // Toggle folder dropdown
                                setShowFolderDropdown(!showFolderDropdown);
                            }}
                        >
                            <span>
                                {folders.find(folder => folder.id === folderId)?.name || 'Select Folder'}
                            </span>
                            <MdArrowDropDown className={`transition-transform ${showFolderDropdown ? 'rotate-180' : ''}`} />
                        </div>
                        <button
                            className="p-1.5 rounded-full hover:opacity-70 flex-shrink-0"
                            style={{ backgroundColor: "#ff5b04" }}
                            onClick={onCreateFolder}
                            title="Add new folder"
                        >
                            <MdAdd className="text-white text-sm" />
                        </button>
                    </div>

                    {/* Folder Dropdown Menu */}
                    {showFolderDropdown && (
                        <div
                            className="absolute z-10 mt-1 rounded-lg shadow-lg w-full"
                            style={{ backgroundColor: "#ffffff", border: "1px solid #075056" }}
                        >
                            {folders.map(folder => (
                                <div
                                    key={folder.id}
                                    className="flex items-center w-full px-3 py-2 text-left hover:bg-[#075056] transition-all text-sm cursor-pointer"
                                    style={{ color: "#075056" }}
                                    onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                                    onMouseLeave={(e) => e.target.style.color = "#075056"}
                                    onClick={() => {
                                        setFolderId(folder.id);
                                        setShowFolderDropdown(false);
                                    }}
                                >
                                    {folder.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Color Selection */}
                <div className="flex-1 min-w-[120px]">
                    <label className="font-medium text-sm block mb-1" style={{ color: "#075056" }}>COLOR</label>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-6 h-6 rounded-lg border cursor-pointer"
                            style={{ backgroundColor: noteColor, borderColor: "#16232a" }}
                            onClick={() => {
                                // Open color picker
                                document.getElementById('color-picker').click();
                            }}
                        ></div>
                        <input
                            id="color-picker"
                            type="color"
                            className="w-0 h-0 opacity-0"
                            value={noteColor}
                            onChange={({ target }) => setNoteColor(target.value)}
                        />
                        <span className="text-xs" style={{ color: "#075056" }}>{noteColor}</span>
                    </div>
                </div>

                {/* Attachment Section - Plus Icon with Dropdown Menu */}
                <div className="flex-1 min-w-[120px]">
                    <label className="font-medium text-sm block mb-1 uppercase tracking-tight" style={{ color: "#075056" }}>
                        ATTACHMENTS {noteData?.isDetailLoading && <span className="text-[10px] lowercase animate-pulse opacity-60">(fetching data...)</span>}
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            className="p-1.5 rounded-full hover:opacity-90 transition-all"
                            style={{ backgroundColor: "#ff5b04", color: "#ffffff" }}
                            onClick={() => {
                                // Close custom dropdowns
                                setShowPriorityDropdown(false);
                                setShowFolderDropdown(false);
                                // Toggle attachment menu
                                setShowAttachmentMenu(!showAttachmentMenu);
                            }}
                            title="Add attachments"
                        >
                            <MdAdd className="text-base" />
                        </button>

                        {/* Stop Recording Button - only shown when recording */}
                        {isRecording && (
                            <button
                                className="p-1.5 rounded-full hover:opacity-90 transition-all flex items-center animate-pulse"
                                style={{ backgroundColor: "#ff5b04", color: "#ffffff" }}
                                onClick={stopRecording}
                                title={isTranscribing ? "Transcribing... Click to stop" : "Stop recording"}
                            >
                                <MdMicOff className="text-base mr-1" />
                                <span className="text-xs">{isTranscribing ? "Transcribing..." : "Stop"}</span>
                            </button>
                        )}
                    </div>

                    {/* Transcription Preview */}
                    {isRecording && currentTranscription && (
                        <div
                            className="mt-2 p-2 rounded-lg text-xs"
                            style={{
                                backgroundColor: "rgba(255, 91, 4, 0.1)",
                                border: "1px solid rgba(255, 91, 4, 0.3)",
                                color: "#16232a"
                            }}
                        >
                            <div className="flex items-center mb-1">
                                <MdMic className="text-[#ff5b04] mr-1" size={14} />
                                <span className="font-medium text-[#ff5b04]">Live Transcription:</span>
                            </div>
                            <p className="italic">{currentTranscription}</p>
                        </div>
                    )}

                    {/* Dropdown Menu */}
                    {showAttachmentMenu && (
                        <div
                            className="absolute z-10 mt-1 rounded-lg shadow-lg py-1 w-40"
                            style={{ backgroundColor: "#ffffff", border: "1px solid #075056" }}
                        >
                            <button
                                className="flex items-center w-full px-3 py-1.5 text-left hover:bg-[#075056] transition-all text-sm"
                                style={{ color: "#075056" }}
                                onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                                onMouseLeave={(e) => e.target.style.color = "#075056"}
                                onClick={() => {
                                    setShowDoodlePanel(true);
                                    setShowAttachmentMenu(false);
                                }}
                            >
                                <MdDraw className="mr-2 text-sm" /> Doodle
                            </button>
                            <label
                                className="flex items-center w-full px-3 py-1.5 text-left hover:bg-[#075056] transition-all cursor-pointer text-sm"
                                style={{ color: "#075056" }}
                                onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                                onMouseLeave={(e) => e.target.style.color = "#075056"}
                            >
                                <MdImage className="mr-2 text-sm" /> Media
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={(e) => {
                                        handleMediaAttachment(e);
                                        setShowAttachmentMenu(false);
                                    }}
                                />
                            </label>
                            <label
                                className="flex items-center w-full px-3 py-1.5 text-left hover:bg-[#075056] transition-all cursor-pointer text-sm"
                                style={{ color: "#075056" }}
                                onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                                onMouseLeave={(e) => e.target.style.color = "#075056"}
                            >
                                <MdAttachFile className="mr-2 text-sm" /> Files
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
                                    multiple
                                    onChange={(e) => {
                                        handleMediaAttachment(e);
                                        setShowAttachmentMenu(false);
                                    }}
                                />
                            </label>
                            <button
                                className={`flex items-center w-full px-3 py-1.5 text-left hover:bg-[#075056] transition-all text-sm`}
                                style={{ color: "#075056" }}
                                onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                                onMouseLeave={(e) => e.target.style.color = "#075056"}
                                onClick={() => {
                                    isRecording ? stopRecording() : startRecording();
                                    setShowAttachmentMenu(false);
                                }}
                            >
                                {isRecording ? <MdMicOff className="mr-2 text-sm" /> : <MdMic className="mr-2 text-sm" />}
                                {isRecording ? 'Stop Recording' : 'Voice Memo'}
                            </button>

                        </div>
                    )}
                </div>
            </div>

            {/* Tags Section */}
            <div className="mt-4">
                <label className="font-medium text-sm" style={{ color: "#075056" }}>TAGS</label>
                <TagInput tags={tags} setTags={setTags} />
            </div>

            {/* Preview Attachments */}
            <div className="flex flex-wrap gap-2 mt-3 overflow-visible">
                {/* Doodle Preview */}
                {doodle && (
                    <div className="relative group">
                        <img
                            src={doodle}
                            alt="Doodle preview"
                            className="w-16 h-16 object-cover rounded-lg border transition-all hover:scale-105 transform"
                            style={{ borderColor: "#16232a" }}
                        />
                        <button
                            className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all z-10"
                            style={{ backgroundColor: "#ff5b04" }}
                            onClick={removeDoodle}
                        >
                            <MdClose className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                        </button>
                    </div>
                )}

                {/* Media Attachments */}
                {mediaAttachments.map((media, index) => (
                    <div key={index} className="relative group">
                        {typeof media === 'string' ? (
                            // Legacy support for old format (just data URL)
                            media.startsWith('data:image') ? (
                                <div className="relative">
                                    <img
                                        src={media}
                                        alt={`attachment-${index}`}
                                        className="w-16 h-16 object-cover rounded-lg border transition-all hover:scale-105 transform cursor-pointer"
                                        style={{ borderColor: "#16232a" }}
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = media;
                                            link.target = '_blank';
                                            link.click();
                                        }}
                                    />
                                    <button
                                        className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all z-10"
                                        style={{ backgroundColor: "#ff5b04" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeMediaAttachment(index);
                                        }}
                                    >
                                        <MdClose className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                                    </button>
                                </div>
                            ) : media.startsWith('data:video') ? (
                                <div className="relative">
                                    <video
                                        src={media}
                                        className="w-16 h-16 object-cover rounded-lg border transition-all hover:scale-105 transform cursor-pointer"
                                        style={{ borderColor: "#16232a" }}
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = media;
                                            link.target = '_blank';
                                            link.click();
                                        }}
                                        controls
                                    />
                                    <button
                                        className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all z-10"
                                        style={{ backgroundColor: "#ff5b04" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeMediaAttachment(index);
                                        }}
                                    >
                                        <MdClose className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative flex flex-col items-center">
                                    <div
                                        className="w-16 h-16 flex items-center justify-center rounded-lg border bg-gray-100 transition-all hover:scale-105 transform cursor-pointer"
                                        style={{ borderColor: "#16232a" }}
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = media;
                                            link.target = '_blank';
                                            link.click();
                                        }}
                                    >
                                        <MdAttachFile className="text-base" style={{ color: "#16232a" }} />
                                    </div>
                                    <button
                                        className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all z-10"
                                        style={{ backgroundColor: "#ff5b04" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeMediaAttachment(index);
                                        }}
                                    >
                                        <MdClose className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                                    </button>
                                </div>
                            )
                        ) : (
                            // New format with metadata
                            media.type.startsWith('image/') ? (
                                <div className="relative">
                                    <img
                                        src={media.data}
                                        alt={media.name}
                                        className="w-16 h-16 object-cover rounded-lg border transition-all hover:scale-105 transform cursor-pointer"
                                        style={{ borderColor: "#16232a" }}
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = media.data;
                                            link.target = '_blank';
                                            link.click();
                                        }}
                                    />
                                    <button
                                        className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all z-10"
                                        style={{ backgroundColor: "#ff5b04" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeMediaAttachment(index);
                                        }}
                                    >
                                        <MdClose className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                                    </button>
                                </div>
                            ) : media.type.startsWith('video/') ? (
                                <div className="relative">
                                    <video
                                        src={media.data}
                                        className="w-16 h-16 object-cover rounded-lg border transition-all hover:scale-105 transform cursor-pointer"
                                        style={{ borderColor: "#16232a" }}
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = media.data;
                                            link.target = '_blank';
                                            link.click();
                                        }}
                                        controls
                                    />
                                    <button
                                        className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all z-10"
                                        style={{ backgroundColor: "#ff5b04" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeMediaAttachment(index);
                                        }}
                                    >
                                        <MdClose className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative flex flex-col items-center">
                                    <div
                                        className="w-16 h-16 flex flex-col items-center justify-center rounded-lg border bg-gray-100 transition-all hover:scale-105 transform cursor-pointer p-1"
                                        style={{ borderColor: "#16232a" }}
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = media.data;
                                            link.download = media.name;
                                            link.click();
                                        }}
                                        title={media.name}
                                    >
                                        <MdAttachFile className="text-base" style={{ color: "#16232a" }} />
                                        <span className="text-[0.6rem] text-center truncate w-full px-1" style={{ color: "#16232a" }} title={media.name}>
                                            {media.name}
                                        </span>
                                    </div>
                                    <button
                                        className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all z-10"
                                        style={{ backgroundColor: "#ff5b04" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeMediaAttachment(index);
                                        }}
                                    >
                                        <MdClose className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                ))}

                {/* File Attachments */}
                {fileAttachments.map((file, index) => {
                    const isString = typeof file === 'string';
                    const fileData = isString ? file : file.data;
                    const fileName = isString ? `File ${index + 1}` : file.name;

                    return (
                        <div key={index} className="relative group">
                            <div
                                className="w-16 h-16 flex flex-col items-center justify-center rounded-lg border bg-gray-100 transition-all hover:scale-105 transform cursor-pointer p-1"
                                style={{ borderColor: "#16232a" }}
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = fileData;
                                    link.download = fileName;
                                    link.click();
                                }}
                                title={fileName}
                            >
                                <MdAttachFile className="text-base" style={{ color: "#16232a" }} />
                                <span className="text-[0.6rem] text-center truncate w-full px-1" style={{ color: "#16232a" }} title={fileName}>
                                    {fileName}
                                </span>
                            </div>
                            <button
                                className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all z-10"
                                style={{ backgroundColor: "#ff5b04" }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFileAttachment(index);
                                }}
                            >
                                <MdClose className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                            </button>
                        </div>
                    );
                })}

                {/* Voice Attachments */}
                {voiceAttachments.map((voice, index) => (
                    <div key={index} className="relative group voice-memo-item">
                        <div className="flex flex-col items-center p-1 rounded-lg border transition-all hover:scale-105 transform" style={{ borderColor: "#16232a", backgroundColor: "#e4eef0" }}>
                            <div className="flex items-center justify-between w-full mb-1">
                                <div className="text-[0.6rem] text-center truncate px-1" style={{ color: "#16232a" }}>
                                    {voiceMemoNames[index] || `Voice Memo ${index + 1}`}
                                </div>
                                <div className="relative">
                                    <button
                                        className="text-[0.6rem] flex items-center"
                                        style={{ color: "#16232a" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Close custom dropdowns
                                            setShowPriorityDropdown(false);
                                            setShowFolderDropdown(false);
                                            setShowAttachmentMenu(false);
                                            // Toggle voice dropdown
                                            setOpenVoiceDropdown(openVoiceDropdown === index ? null : index);
                                            // Hide playback speed menu when toggling main dropdown
                                            if (openVoiceDropdown === index) {
                                                setShowPlaybackSpeedMenu(null);
                                            }
                                        }}
                                        title="More options"
                                    >
                                        <MdMoreVert />
                                    </button>
                                    {/* Dropdown Menu */}
                                    <div className={`absolute right-0 rounded-lg shadow-lg py-2 w-40 z-20 ${openVoiceDropdown === index ? '' : 'hidden'}`}
                                        style={{ backgroundColor: "#ffffff", border: "1px solid #075056", bottom: "calc(100% + 5px)" }}
                                    >
                                        <button
                                            className="flex items-center w-full px-3 py-2 text-left hover:bg-[#075056] transition-all text-xs"
                                            style={{ color: "#075056" }}
                                            onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                                            onMouseLeave={(e) => e.target.style.color = "#075056"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Download as MP3 functionality
                                                const link = document.createElement('a');
                                                link.href = voice;
                                                link.download = `${voiceMemoNames[index] || `voice-memo-${index + 1}`}.mp3`;
                                                link.click();
                                                setOpenVoiceDropdown(null);
                                            }}
                                        >
                                            <MdDownload className="mr-2 text-xs" /> Download MP3
                                        </button>
                                        <button
                                            className="flex items-center w-full px-3 py-2 text-left hover:bg-[#075056] transition-all text-xs"
                                            style={{ color: "#075056" }}
                                            onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                                            onMouseLeave={(e) => e.target.style.color = "#075056"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newName = prompt("Rename voice memo:", voiceMemoNames[index] || `Voice Memo ${index + 1}`);
                                                if (newName !== null && newName.trim() !== "") {
                                                    // Update the voice memo name
                                                    setVoiceMemoNames(prevNames => {
                                                        const newNames = [...prevNames];
                                                        newNames[index] = newName.trim();
                                                        return newNames;
                                                    });
                                                }
                                                setOpenVoiceDropdown(null);
                                            }}
                                        >
                                            <MdEdit className="mr-2 text-xs" /> Rename
                                        </button>
                                        <button
                                            className="flex items-center w-full px-3 py-2 text-left hover:bg-[#075056] transition-all text-xs"
                                            style={{ color: "#075056" }}
                                            onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                                            onMouseLeave={(e) => e.target.style.color = "#075056"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Show playback speed submenu
                                                setShowPlaybackSpeedMenu(showPlaybackSpeedMenu === index ? null : index);
                                                console.log("Toggle playback speed menu for index:", index);
                                            }}
                                        >
                                            <MdSpeed className="mr-2 text-xs" /> Playback Speed
                                        </button>
                                        {/* Playback Speed Submenu */}
                                        <div className={`absolute left-full bottom-0 rounded-lg shadow-lg py-2 w-32 z-30 ${showPlaybackSpeedMenu === index ? '' : 'hidden'}`}
                                            style={{ backgroundColor: "#ffffff", border: "1px solid #075056", bottom: "calc(100% + 5px)" }}>
                                            <div className="px-3 py-1 text-xs font-medium" style={{ color: "#075056" }}>Playback Speed</div>
                                            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
                                                <button
                                                    key={speed}
                                                    className="flex items-center w-full px-3 py-2 text-left hover:bg-[#075056] transition-all text-xs"
                                                    style={{ color: "#075056" }}
                                                    onMouseEnter={(e) => e.target.style.color = "#ffffff"}
                                                    onMouseLeave={(e) => e.target.style.color = "#075056"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const audio = document.getElementById(`voice-memo-${index}`);
                                                        if (audio) {
                                                            audio.playbackRate = speed;
                                                        }
                                                        console.log("Setting playback speed to", speed, "for audio index", index);
                                                        // Hide submenu and main dropdown
                                                        setShowPlaybackSpeedMenu(null);
                                                        setOpenVoiceDropdown(null);
                                                    }}
                                                >
                                                    {speed}x
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center w-full gap-1">
                                <audio
                                    id={`voice-memo-${index}`}
                                    src={voice}
                                    className="hidden"
                                    onPlay={() => {
                                        setPlayingAudio(index);
                                    }}
                                    onPause={() => {
                                        setPlayingAudio(null);
                                    }}
                                    onEnded={() => {
                                        setPlayingAudio(null);
                                    }}
                                    onLoadedMetadata={(e) => {
                                        // Duration is automatically available, no need to do anything here
                                    }}
                                />
                                <button
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: "#075056" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const audio = document.getElementById(`voice-memo-${index}`);
                                        if (audio) {
                                            if (audio.paused) {
                                                // Pause all other audios first
                                                document.querySelectorAll('audio[id^="voice-memo-"]').forEach(a => {
                                                    if (a !== audio) {
                                                        a.pause();
                                                    }
                                                });
                                                audio.play();
                                            } else {
                                                audio.pause();
                                            }
                                        }
                                    }}
                                    title="Play/Pause"
                                >
                                    {/* Show play or pause icon based on audio state */}
                                    {playingAudio === index ? (
                                        <MdPause className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                                    ) : (
                                        <MdAudiotrack className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                                    )}
                                </button>
                                <div className="text-[0.6rem] flex-grow text-center" style={{ color: "#16232a" }}>
                                    {(() => {
                                        const audio = document.getElementById(`voice-memo-${index}`);
                                        if (audio && audio.duration && isFinite(audio.duration)) {
                                            const minutes = Math.floor(audio.duration / 60);
                                            const seconds = Math.floor(audio.duration % 60);
                                            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                                        }
                                        return "0:00";
                                    })()}
                                </div>
                            </div>
                            <button
                                className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all z-10"
                                style={{ backgroundColor: "#ff5b04" }}
                                onClick={() => removeVoiceAttachment(index)}
                            >
                                <MdClose className="text-[0.6rem]" style={{ color: "#e4eef0" }} />
                            </button>
                        </div>
                    </div>
                ))}


            </div>

            {error && <p className="text-red-500 text-sm pt-3">{error}</p>}

            <button
                className={`font-medium mt-4 p-2 rounded-lg w-full transition-all transform text-sm ${noteData?.isDetailLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                style={{ backgroundColor: "#ff5b04", color: "#ffffff" }}
                onClick={handleAddNote}
                disabled={noteData?.isDetailLoading}
            >
                {noteData?.isDetailLoading ? 'FETCHING DATA...' : (type === 'edit' ? 'UPDATE NOTE' : 'CREATE NOTE')}
            </button>

            {/* Doodle Panel */}
            {showDoodlePanel && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-3 border-b" style={{ borderColor: "#16232a" }}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold" style={{ color: "#075056" }}>Doodle</h2>
                                <button
                                    className="text-gray-500 hover:text-gray-700 transition-all"
                                    onClick={() => setShowDoodlePanel(false)}
                                >
                                    <MdClose size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Doodle Tools */}
                        <div className="p-3 border-b bg-gray-50" style={{ borderColor: "#16232a" }}>
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Pen Tools */}
                                <div className="flex gap-1 bg-white p-1 rounded-lg shadow">
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${penType === 'pen' && selectedTool === 'pen' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                        onClick={() => {
                                            setSelectedTool('pen');
                                            setPenType('pen');
                                        }}
                                        title="Pen"
                                    >
                                        <MdBrush size={16} style={{ color: "#16232a" }} />
                                    </button>
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${penType === 'pencil' && selectedTool === 'pen' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                        onClick={() => {
                                            setSelectedTool('pen');
                                            setPenType('pencil');
                                        }}
                                        title="Pencil"
                                    >
                                        <MdDraw size={16} style={{ color: "#16232a" }} />
                                    </button>
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${penType === 'highlighter' && selectedTool === 'pen' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                        onClick={() => {
                                            setSelectedTool('pen');
                                            setPenType('highlighter');
                                        }}
                                        title="Highlighter"
                                    >
                                        <MdDraw size={16} style={{ color: "#16232a" }} />
                                    </button>
                                </div>

                                {/* Shape Tools */}
                                <div className="flex gap-1 bg-white p-1 rounded-lg shadow">
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${selectedTool === 'line' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                        onClick={() => setSelectedTool('line')}
                                        title="Line"
                                    >
                                        <MdHorizontalRule size={16} style={{ color: "#16232a" }} />
                                    </button>
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${selectedTool === 'square' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                        onClick={() => setSelectedTool('square')}
                                        title="Square"
                                    >
                                        <MdCheckBoxOutlineBlank size={16} style={{ color: "#16232a" }} />
                                    </button>
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${selectedTool === 'circle' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                        onClick={() => setSelectedTool('circle')}
                                        title="Circle"
                                    >
                                        <CircleIcon size={16} color="#16232a" />
                                    </button>
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${selectedTool === 'triangle' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                        onClick={() => setSelectedTool('triangle')}
                                        title="Triangle"
                                    >
                                        <TriangleIcon size={16} color="#16232a" />
                                    </button>
                                    <button
                                        className={`p-1.5 rounded-md transition-all ${selectedTool === 'eraser' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                        onClick={() => setSelectedTool('eraser')}
                                        title="Eraser"
                                    >
                                        <EraserIcon size={16} color="#16232a" />
                                    </button>
                                </div>

                                {/* Color Picker */}
                                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg shadow">
                                    <span className="text-xs" style={{ color: "#075056" }}>Color:</span>
                                    <input
                                        type="color"
                                        value={brushColor}
                                        onChange={(e) => setBrushColor(e.target.value)}
                                        className="w-6 h-6 border rounded cursor-pointer"
                                        style={{ borderColor: "#16232a" }}
                                    />
                                </div>

                                {/* Brush Size */}
                                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg shadow">
                                    <span className="text-xs" style={{ color: "#075056" }}>Size:</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                        className="w-20"
                                    />
                                    <span className="text-xs w-6" style={{ color: "#075056" }}>{brushSize}</span>
                                </div>

                                {/* Undo/Redo */}
                                <div className="flex gap-1 bg-white p-1 rounded-lg shadow">
                                    <button
                                        className={`p-1.5 rounded-md hover:bg-gray-100 transition-all ${historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={undo}
                                        disabled={historyIndex <= 0}
                                        title="Undo"
                                    >
                                        <MdUndo size={16} style={{ color: "#16232a" }} />
                                    </button>
                                    <button
                                        className={`p-1.5 rounded-md hover:bg-gray-100 transition-all ${historyIndex >= historyLength - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={redo}
                                        disabled={historyIndex >= historyLength - 1}
                                        title="Redo"
                                    >
                                        <MdRedo size={16} style={{ color: "#16232a" }} />
                                    </button>
                                </div>

                                {/* Clear */}
                                <button
                                    className="p-1.5 rounded-md hover:bg-gray-100 transition-all bg-white shadow"
                                    onClick={clearDoodle}
                                    title="Clear"
                                >
                                    <MdClose size={16} style={{ color: "#16232a" }} />
                                </button>
                            </div>
                        </div>

                        {/* Doodle Canvas */}
                        <div className="p-3 flex justify-center bg-gray-100 flex-grow">
                            <div className="bg-white border rounded-lg shadow-lg overflow-hidden">
                                <canvas
                                    ref={canvasRef}
                                    width={600}
                                    height={400}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    className="cursor-crosshair"
                                    style={{
                                        backgroundColor: "white",
                                        cursor: "crosshair"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Doodle Actions */}
                        <div className="p-3 border-t flex justify-end gap-2" style={{ borderColor: "#16232a" }}>
                            <button
                                className="px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90 text-sm"
                                style={{ backgroundColor: "#ff5b04", color: "#ffffff" }}
                                onClick={() => setShowDoodlePanel(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-1.5 rounded-lg font-medium text-white transition-all hover:opacity-90 text-sm"
                                style={{ backgroundColor: "#ff5b04" }}
                                onClick={saveDoodle}
                            >
                                Save Doodle
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default AddEditNotes;