import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Navbar from "../../components/Navbar/Navbar";
import { motion } from "framer-motion";
import AddEditNotes from "./AddEditNotes";
import {
  MdAdd,
  MdClose,
  MdSearch,
  MdPushPin,
  MdFolder,
  MdFilterList,
  MdDelete,
  MdEdit,
  MdOutlinePushPin,
  MdDownload,
  MdClearAll,
  MdAudiotrack,
  MdAttachFile,
  MdStickyNote2,
  MdArrowDropDown
} from "react-icons/md";
import StickyNote from "../../components/StickyNote/StickyNote";
import Toast from "../../components/ToastMessage/Toast";

// Helper function to determine text color based on background color
const getContrastColor = (hexColor) => {
  // Remove # if present
  const color = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [showDemoNotes, setShowDemoNotes] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Sticky Notes State
  const [stickyNotes, setStickyNotes] = useState([]);

  const [folders, setFolders] = useState([
    { id: 1, name: 'Personal', color: '#075056' },
    { id: 2, name: 'Work', color: '#ff5b04' },
    { id: 3, name: 'Ideas', color: '#16232a' }
  ]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    shared: 'all',
    priority: 'all',
    dateRange: 'all',
    folderId: 'all'
  });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // New note modal state
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  // Note detail modal state
  const [showNoteDetailModal, setShowNoteDetailModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Edit note modal state
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [editNote, setEditNote] = useState({
    id: null,
    title: '',
    content: '',
    priority: 'medium',
    color: '#e4eef0',
    folderId: 1,
    shared: false,
    tags: [],
    attachments: [],
    fileAttachments: [],
    voiceMemos: [],
    doodles: []
  });

  // Folder management states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolder, setNewFolder] = useState({ name: '', color: '#075056' });
  const [editingFolder, setEditingFolder] = useState(null);
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);

  // Toast State
  const [showToastMsg, setShowToastMsg] = useState({
    show: false,
    message: "",
    type: "add",
  });

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      show: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      show: false,
      message: "",
    });
  };

  // Filter Dropdown States
  const [showPriorityFilterDropdown, setShowPriorityFilterDropdown] = useState(false);
  const [showDateFilterDropdown, setShowDateFilterDropdown] = useState(false);

  // Click outside handler for filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPriorityFilterDropdown || showDateFilterDropdown) {
        const pDropdown = document.querySelector('.priority-filter-dropdown');
        const dDropdown = document.querySelector('.date-filter-dropdown');
        if (pDropdown && !pDropdown.contains(event.target)) {
          setShowPriorityFilterDropdown(false);
        }
        if (dDropdown && !dDropdown.contains(event.target)) {
          setShowDateFilterDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPriorityFilterDropdown, showDateFilterDropdown]);

  const navigate = useNavigate();

  // Get user info
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

  // Get sticky notes
  const getStickyNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-sticky-notes");
      if (response.data && response.data.stickyNotes) {
        setStickyNotes(response.data.stickyNotes);
      }
    } catch (error) {
      console.log("Error getting sticky notes:", error);
    }
  };

  // Add Sticky Note
  const addStickyNote = async () => {
    try {
      const response = await axiosInstance.post("/add-sticky-note", {
        content: "",
        color: "#fff3cd",
        x: 250,
        y: 250
      });
      if (response.data && response.data.stickyNote) {
        setStickyNotes(prev => [...prev, response.data.stickyNote]);
      }
    } catch (error) {
      console.error("Error adding sticky note:", error);
      showToastMessage("Failed to add sticky note", "error");
    }
  };

  // Update Sticky Note
  const updateStickyNote = async (id, data) => {
    // Optimistic update
    setStickyNotes(prev => prev.map(note => note._id === id ? { ...note, ...data } : note));

    try {
      await axiosInstance.put(`/edit-sticky-note/${id}`, data);
    } catch (error) {
      console.error("Error updating sticky note:", error);
      // Revert on failure? (Maybe overkill for now)
    }
  };

  // Delete Sticky Note
  const deleteStickyNote = async (id) => {
    if (!id) {
      showToastMessage("Cannot delete sticky note: ID is missing.", "error");
      return;
    }

    if (window.confirm("Delete this sticky note?")) {
      try {
        const response = await axiosInstance.delete(`/delete-sticky-note/${id}`);

        if (response.data && !response.data.error) {
          setStickyNotes(prev => prev.filter(note => (note._id || note.id) !== id));
          showToastMessage("Sticky note deleted successfully", "success");
        } else {
          showToastMessage(response.data?.message || "Failed to delete sticky note", "error");
        }
      } catch (error) {
        console.error("Error deleting sticky note:", error);
        showToastMessage("Error deleting sticky note", "error");
      }
    }
  };


  // New function to fetch full note data for summary view notes
  const fetchNoteDetails = async (note) => {
    // If it's a demo note or already has heavy data, no need to fetch
    if (note.id.toString().startsWith('demo') || (note.attachments && note.attachments.some(a => a.data))) {
      return note;
    }

    try {
      const response = await axiosInstance.get(`/get-note/${note.id}`);
      if (response.data && response.data.note) {
        const fullNote = response.data.note;
        // Transform full note to match local state format
        return {
          ...note,
          attachments: fullNote.mediaAttachments || [],
          fileAttachments: fullNote.fileAttachments || [],
          doodles: fullNote.doodle ? [fullNote.doodle] : [],
          voiceMemos: fullNote.voiceAttachments || []
        };
      }
    } catch (error) {
      console.error("Error fetching note details:", error);
      showToastMessage("Failed to load note attachments", "error");
    }
    return note;
  };

  // Get all notes
  const getAllNotes = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/get-all-notes");

      if (response && response.data && response.data.notes) {
        const notes = response.data.notes.map(note => ({
          id: note._id,
          _id: note._id,
          title: note.title,
          content: note.content,
          tags: note.tags || [],
          pinned: note.isPinned || false,
          priority: note.priority || 'medium',
          color: note.color || '#e4eef0',
          folderId: note.folderId || 1,
          shared: false,
          attachments: note.mediaAttachments || [],
          fileAttachments: note.fileAttachments || [],
          doodles: note.doodle ? [note.doodle] : [],
          voiceMemos: note.voiceAttachments || [],
          createdAt: note.createdOn,
          updatedAt: note.updatedOn || note.createdOn
        }));

        setAllNotes(notes);
      } else {
        setAllNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setAllNotes([]);
    } finally {
      setIsLoading(false);
    }
  };



  // Reusable filter function to avoid duplication
  const filterNote = (note) => {
    try {


      // Folder filter
      const folderMatch = filters.folderId === 'all' || !filters.folderId || note.folderId === filters.folderId;

      // Search filter (title, content, tags, file names)
      const searchMatch = searchQuery === '' ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (note.attachments && note.attachments.map(a => typeof a === 'object' ? (a.name || '') : '').some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (note.fileAttachments && note.fileAttachments.some(file => {
          // Only search file names. Ignore raw Data URLs to prevent false positives.
          const fileName = typeof file === 'object' ? (file.name || '') : '';
          return fileName.toLowerCase().includes(searchQuery.toLowerCase());
        }));

      // Shared filter
      const sharedMatch = filters.shared === 'all' ||
        (filters.shared === 'shared' && note.shared) ||
        (filters.shared === 'private' && !note.shared);

      // Priority filter
      const priorityMatch = filters.priority === 'all' || note.priority === filters.priority;

      // Date range filter
      let dateMatch = true;
      if (filters.dateRange !== 'all') {
        const noteDate = new Date(note.updatedAt);
        const today = new Date();

        if (isNaN(noteDate.getTime())) {
          dateMatch = false;
        } else if (filters.dateRange === 'today') {
          dateMatch = noteDate.toDateString() === today.toDateString();
        } else if (filters.dateRange === 'week') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);
          dateMatch = noteDate >= oneWeekAgo;
        } else if (filters.dateRange === 'month') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(today.getMonth() - 1);
          dateMatch = noteDate >= oneMonthAgo;
        } else if (filters.dateRange === 'custom' && dateRange.start && dateRange.end) {
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            dateMatch = noteDate >= startDate && noteDate <= endDate;
          } else {
            dateMatch = true;
          }
        }
      }

      return folderMatch && searchMatch && sharedMatch && priorityMatch && dateMatch;
    } catch (error) {
      console.error('Error filtering notes:', error);
      return true;
    }
  };

  // Filter notes based on search query and filters
  const filteredNotes = allNotes.filter(note => {
    const result = filterNote(note);
    return result;
  });

  console.log("All Notes:", allNotes);
  console.log("Filtered Notes:", filteredNotes);
  console.log("Current Filters:", filters);

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handle new note submission


  // Function to handle note editing
  const handleEditNote = async (summaryNote) => {
    // Open modal immediately with summary data to feel fast
    setEditNote({ ...summaryNote, isDetailLoading: true });
    setShowEditNoteModal(true);

    // Fetch details in background only if needed
    if (!summaryNote.id.toString().startsWith('demo')) {
      try {
        const response = await axiosInstance.get(`/get-note/${summaryNote.id}`);
        if (response.data && response.data.note) {
          const fullNote = response.data.note;
          // Synchronize state with full details
          setEditNote({
            ...summaryNote,
            attachments: fullNote.mediaAttachments || [],
            fileAttachments: fullNote.fileAttachments || [],
            doodles: fullNote.doodle ? [fullNote.doodle] : [],
            voiceMemos: fullNote.voiceAttachments || [],
            isDetailLoading: false
          });
        }
      } catch (error) {
        console.error("Error fetching note details:", error);
        setEditNote(prev => ({ ...prev, isDetailLoading: false }));
      }
    } else {
      setEditNote(prev => ({ ...prev, isDetailLoading: false }));
    }
  };

  // Function to handle note deletion
  const handleDeleteNote = async (noteId) => {
    if (!noteId) {
      showToastMessage("Cannot delete note: ID is missing.", "error");
      return;
    }

    // Special handling for demo notes
    if (noteId.toString().startsWith('demo')) {
      if (window.confirm('This is a demo note. Would you like to remove it and start with your own notes?')) {
        setShowDemoNotes(false);
        setAllNotes(prev => prev.filter(note => note.id !== noteId));
        showToastMessage("Demo note removed successfully", "success");
      }
      return;
    }

    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await axiosInstance.delete(`/delete-note/${noteId}`);

        if (response.data && !response.data.error) {
          // Remove the note from the list
          setAllNotes(prevNotes => prevNotes.filter(n => n.id.toString() !== noteId.toString()));
          showToastMessage("Note deleted successfully", "success");
        } else {
          showToastMessage(response.data?.message || "Failed to delete note", "error");
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete note. Please try again.';
        showToastMessage(errorMessage, "error");
      }
    }
  };

  // Function to toggle pin status with Optimistic UI update
  const togglePinNote = async (noteId, currentPinnedStatus) => {
    // OPTIMISTIC UPDATE: Change UI immediately
    setAllNotes(prevNotes =>
      prevNotes.map(n =>
        n.id === noteId
          ? { ...n, pinned: !currentPinnedStatus }
          : n
      )
    );

    try {
      const response = await axiosInstance.put(`/update-note-pinned/${noteId}`, {
        isPinned: !currentPinnedStatus
      });

      if (response.data && response.data.note) {
        // Sync with actual server timestamps/state
        const note = response.data.note;
        setAllNotes(prevNotes =>
          prevNotes.map(n =>
            n.id === noteId
              ? {
                ...n,
                pinned: note.isPinned,
                updatedAt: note.createdOn
              }
              : n
          )
        );
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      // REVERT: If server call fails, put it back
      setAllNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === noteId
            ? { ...n, pinned: currentPinnedStatus }
            : n
        )
      );
      showToastMessage("Failed to update pin status", "error");
    }
  };



  // Function to filter notes by folder
  const handleFolderSelect = (folderId) => {
    // Update filters to show only notes from selected folder
    setFilters(prev => ({
      ...prev,
      folderId: folderId
    }));
  };

  // Function to show all notes (reset folder filter)
  const handleShowAllNotes = () => {
    setFilters(prev => ({
      ...prev,
      folderId: 'all'
    }));
  };

  // Folder management functions
  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolder.name.trim()) return;

    const folderToAdd = {
      id: folders.length > 0 ? Math.max(...folders.map(f => f.id)) + 1 : 1,
      name: newFolder.name,
      color: newFolder.color
    };

    setFolders(prev => [...prev, folderToAdd]);
    setNewFolder({ name: '', color: '#075056' });
    setShowFolderModal(false);
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setShowEditFolderModal(true);
  };

  const handleUpdateFolder = (e) => {
    e.preventDefault();
    if (!editingFolder.name.trim()) return;

    setFolders(prev =>
      prev.map(folder =>
        folder.id === editingFolder.id
          ? { ...folder, name: editingFolder.name, color: editingFolder.color }
          : folder
      )
    );

    setEditingFolder(null);
    setShowEditFolderModal(false);
  };

  const handleDeleteFolder = (folder) => {
    setFolderToDelete(folder);
    setShowDeleteFolderModal(true);
  };

  const confirmDeleteFolder = () => {
    // Remove the folder
    setFolders(prev => prev.filter(folder => folder.id !== folderToDelete.id));

    // Move notes from this folder to the first folder (or default)
    const defaultFolderId = folders.length > 1 ? folders.find(f => f.id !== folderToDelete.id)?.id || 1 : 1;
    setAllNotes(prev =>
      prev.map(note =>
        note.folderId === folderToDelete.id
          ? { ...note, folderId: defaultFolderId }
          : note
      )
    );

    // Reset filter if we're viewing the deleted folder
    if (filters.folderId === folderToDelete.id) {
      handleShowAllNotes();
    }

    setFolderToDelete(null);
    setShowDeleteFolderModal(false);
  };

  // Component did mount - fetch user info and notes
  useEffect(() => {
    getUserInfo();
    getAllNotes();
    getStickyNotes();
  }, []);

  // Logout
  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#e4eef0" }}>
      {/* Navbar */}
      <Navbar onLogout={onLogout} />

      <div className="flex pt-32">
        {/* Sidebar */}
        <aside
          className="w-64 min-h-screen border-r p-6 sticky top-32 h-fit hidden md:block"
          style={{
            backgroundColor: "rgba(228, 238, 240, 0.7)",
            borderColor: "rgba(22, 35, 42, 0.1)",
            backdropFilter: "blur(10px)"
          }}
        >
          {/* Folders Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center" style={{ color: "#16232a" }}>
                <MdFolder className="mr-2" /> Folders
              </h2>
              <button
                className="p-1 rounded-full hover:opacity-90 transition-all"
                style={{ backgroundColor: "#075056" }}
                onClick={() => {
                  setNewFolder({ name: '', color: '#075056' });
                  setShowFolderModal(true);
                }}
              >
                <MdAdd className="text-lg" style={{ color: "#e4eef0" }} />
              </button>
            </div>
            <ul className="space-y-2">
              <li
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left cursor-pointer transition-all duration-200 group ${!filters.folderId || filters.folderId === 'all' ? "shadow-md" : "hover:bg-white/40"
                  }`}
                style={{
                  backgroundColor: !filters.folderId || filters.folderId === 'all' ? "#075056" : "transparent",
                  color: !filters.folderId || filters.folderId === 'all' ? "#e4eef0" : "#16232a",
                  transform: !filters.folderId || filters.folderId === 'all' ? "scale(1.02)" : "scale(1)"
                }}
                onClick={handleShowAllNotes}
              >
                <div className="flex items-center">
                  <MdFolder className={`mr-3 text-xl ${!filters.folderId || filters.folderId === 'all' ? "text-[#ff5b04]" : "text-[#075056]"}`} />
                  <span className="font-medium">All Notes</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${!filters.folderId || filters.folderId === 'all' ? "bg-white/20" : "bg-black/5"}`}>
                  {filteredNotes.length}
                </span>
              </li>
              {folders.map(folder => (
                <li
                  key={folder.id}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left group transition-all duration-200 cursor-pointer ${filters.folderId === folder.id ? "shadow-md bg-white" : "hover:bg-white/40"}`}
                  style={{
                    borderLeft: `4px solid ${folder.color}`,
                    backgroundColor: filters.folderId === folder.id ? "white" : "transparent"
                  }}
                  onClick={() => handleFolderSelect(folder.id)}
                >
                  <div className="flex items-center flex-1">
                    <span
                      className="w-3 h-3 rounded-full mr-3 shadow-sm"
                      style={{ backgroundColor: folder.color }}
                    ></span>
                    <span className="font-medium">{folder.name}</span>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      className="p-1.5 rounded-lg hover:bg-[#075056] hover:text-white transition-colors"
                      style={{ color: "#16232a" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFolder(folder);
                      }}
                    >
                      <MdEdit size={14} />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                      style={{ color: "#16232a" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder);
                      }}
                    >
                      <MdDelete size={14} />
                    </button>
                  </div>
                  <span className={`text-xs ml-2 px-2 py-1 rounded-full ${filters.folderId === folder.id ? "bg-[#e4eef0]" : "bg-black/5"}`}>
                    {filteredNotes.filter(note => note.folderId === folder.id).length}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pinned Notes Section */}
          {filteredNotes.filter(note => note.pinned).length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-xs uppercase tracking-widest mb-4 flex items-center opacity-50" style={{ color: "#16232a" }}>
                <MdPushPin className="mr-2 text-[#ff5b04]" /> Pinned
              </h2>
              <div className="space-y-3 pb-6 border-b border-black/5">
                {filteredNotes.filter(note => note.pinned).map(note => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg group relative border border-transparent hover:border-white/50"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.4)",
                      backdropFilter: "blur(5px)",
                    }}
                    onClick={() => {
                      setSelectedNote(note);
                      setShowNoteDetailModal(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <h3
                        className="font-bold text-sm truncate flex-1 leading-tight pr-2"
                        style={{ color: "#16232a" }}
                      >
                        {note.title}
                      </h3>
                      <button
                        className="p-1.5 rounded-lg bg-[#ff5b04] text-white transition-all shadow-lg hover:bg-[#e04f03] border border-[#ff5b04] flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinNote(note.id, note.pinned);
                        }}
                        title="Unpin note"
                      >
                        <MdPushPin size={16} className="rotate-45" />
                      </button>
                    </div>
                    <p
                      className="text-[11px] mt-2 line-clamp-2 leading-relaxed opacity-70"
                      style={{ color: "#16232a" }}
                    >
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Search & Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="text-lg" style={{ color: "#16232a" }} />
                </div>
                <input
                  type="text"
                  placeholder="Search your thoughts..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 transition-all shadow-lg hover:shadow-xl"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    color: "#16232a",
                    outline: "none",
                    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)"
                  }}
                  value={searchQuery}
                  onChange={handleSearch}
                />
                {searchQuery && (
                  <button
                    className="absolute inset-y-0 right-4 flex items-center hover:text-[#ff5b04] transition-all"
                    onClick={() => setSearchQuery("")}
                  >
                    <MdClose className="text-xl" style={{ color: "#16232a" }} />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  className="px-4 py-3 rounded-full flex items-center font-medium hover:opacity-90 transition-all"
                  style={{ backgroundColor: "#16232a", color: "#e4eef0" }}
                  onClick={() => document.getElementById('filters-modal').classList.remove('hidden')}
                >
                  <MdFilterList className="mr-2" /> Filters
                </button>
                <button
                  className="px-4 py-3 rounded-full font-medium hover:opacity-90 transition-all"
                  style={{ backgroundColor: "#ff5b04", color: "#e4eef0" }}
                  onClick={() => {
                    setFilters({
                      shared: 'all',
                      priority: 'all',
                      dateRange: 'all',
                      folderId: 'all'
                    });
                    setDateRange({ start: '', end: '' });
                  }}
                >
                  <MdClearAll className="mr-2 inline" /> Clear
                </button>
              </div>
            </div>
          </div>


          {/* Notes Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: "#16232a" }}>
              {filters.folderId !== 'all' ? folders.find(f => f.id === filters.folderId)?.name : 'All Notes'} ({filteredNotes.length})
            </h2>
            <div className="flex items-center space-x-3">
              <button
                className="px-4 py-2 rounded-lg font-medium flex items-center hover:opacity-90 transition-all shadow-md"
                style={{ backgroundColor: "#ffcc00", color: "#16232a" }}
                onClick={() => {
                  addStickyNote();
                }}
              >
                <MdStickyNote2 className="mr-2" /> Sticky Note
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium text-white flex items-center hover:opacity-90 transition-all shadow-md"
                style={{ backgroundColor: "#075056" }}
                onClick={() => {
                  setShowNewNoteModal(true);
                }}
              >
                <MdAdd className="mr-2" /> Create Note
              </button>
            </div>
          </div>

          {/* Notes Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#075056] mb-4"></div>
              <h3 className="text-xl font-bold" style={{ color: "#16232a" }}>Loading notes...</h3>
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNotes.map(note => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className={`rounded-2xl p-5 shadow-sm transition-all duration-300 relative group overflow-hidden ${note.color === '#e4eef0' ? 'border border-gray-200' : ''}`}
                  style={{
                    backgroundColor: note.color,
                    color: note.color === '#e4eef0' ? '#16232a' : '#16232a',
                    cursor: 'pointer',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
                  }}
                  onClick={async () => {
                    const fullNote = await fetchNoteDetails(note);
                    setSelectedNote(fullNote);
                    setShowNoteDetailModal(true);
                  }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-white/20 transition-all"></div>
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <h3 style={{
                      color: '#16232a',
                      margin: 0,
                      fontSize: '1.2rem',
                    }} className="font-bold truncate pr-6">
                      {note.title}
                    </h3>
                    <div className="absolute top-0 right-0">
                      {note.pinned && (
                        <MdPushPin className="text-[#ff5b04] rotate-45 transform drop-shadow-sm" style={{
                          fontSize: '1.2rem'
                        }} />
                      )}
                    </div>
                  </div>
                  <div style={{
                    color: "rgba(22, 35, 42, 0.8)",
                    lineHeight: '1.5',
                    fontSize: '0.95rem',
                    flex: 1,
                    overflow: 'hidden'
                  }} className="mb-4 relative z-10">
                    <p>{note.content.substring(0, 85)}{note.content.length > 85 ? '...' : ''}</p>
                  </div>

                  {/* Priority and Folder Information */}
                  <div className="flex justify-between items-center mb-3 relative z-10">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${note.priority === 'high' || note.priority === 'urgent'
                      ? 'bg-red-100 text-red-600 border border-red-200'
                      : note.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-green-100 text-green-600 border border-green-200'
                      }`}>
                      {note.priority}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[90px] shadow-sm uppercase tracking-wider"
                      style={{
                        backgroundColor: folders.find(f => f.id === note.folderId)?.color || '#16232a',
                        color: getContrastColor(folders.find(f => f.id === note.folderId)?.color || '#16232a'),
                      }}
                      title={folders.find(f => f.id === note.folderId)?.name || 'Uncategorized'}
                    >
                      {folders.find(f => f.id === note.folderId)?.name || 'Uncategorized'}
                    </span>
                  </div>

                  {/* Media indicators */}
                  <div className="flex space-x-1 mb-2">
                    {note.hasMedia && (
                      <div className="flex items-center text-xs opacity-60" style={{ color: note.color === '#e4eef0' ? 'black' : '#16232a' }}>
                        <MdDownload className="mr-0.5" size={12} />
                      </div>
                    )}
                    {note.hasFiles && (
                      <div className="flex items-center text-xs opacity-60" style={{ color: note.color === '#e4eef0' ? 'black' : '#16232a' }}>
                        <MdAttachFile className="mr-0.5" size={12} />
                      </div>
                    )}
                    {note.hasDoodle && (
                      <div className="flex items-center text-xs opacity-60" style={{ color: note.color === '#e4eef0' ? 'black' : '#16232a' }}>
                        <MdEdit className="mr-0.5" size={12} />
                      </div>
                    )}
                    {note.hasVoice && (
                      <div className="flex items-center text-xs opacity-60" style={{ color: note.color === '#e4eef0' ? 'black' : '#16232a' }}>
                        <MdAudiotrack className="mr-0.5" size={12} />
                      </div>
                    )}
                  </div>


                  {/* Action buttons */}
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-black/5 relative z-10">
                    <span className="text-[10px] font-medium opacity-60">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-1">
                      {!note.id.toString().startsWith('demo') && (
                        <>
                          <button
                            className={`p-2 rounded-xl transition-all shadow-md flex items-center justify-center ${note.pinned ? 'bg-[#ff5b04] text-white border-transparent' : 'bg-white/80 text-[#16232a] border border-black/5 hover:bg-white'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePinNote(note.id, note.pinned);
                            }}
                            title={note.pinned ? "Unpin note" : "Pin note"}
                          >
                            {note.pinned ? <MdPushPin size={20} className="drop-shadow-sm" /> : <MdOutlinePushPin size={20} />}
                          </button>
                          <button
                            className="p-2 rounded-xl bg-white/80 text-[#16232a] border border-black/5 shadow-md hover:bg-white transition-all flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNote(note);
                            }}
                            title="Edit note"
                          >
                            <MdEdit size={20} />
                          </button>
                          <button
                            className="p-2 rounded-xl bg-white/80 text-[#16232a] border border-black/5 shadow-md hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            title="Delete note"
                          >
                            <MdDelete size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center rounded-2xl shadow-inner border border-dashed border-gray-300" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
              <MdFolder className="text-5xl mb-4 opacity-20" style={{ color: "#16232a" }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: "#16232a" }}>No notes found</h3>
              <p className="mb-6 max-w-xs mx-auto opacity-60" style={{ color: "#16232a" }}>
                {searchQuery || filters.folderId !== 'all' || filters.shared !== 'all' || filters.priority !== 'all' || filters.dateRange !== 'all'
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Every big idea starts with a small note. Create yours today!"}
              </p>
              <div className="flex items-center space-x-3">
                <button
                  className="px-6 py-3 rounded-xl font-bold flex items-center hover:scale-105 transition-all shadow-lg active:scale-95"
                  style={{ backgroundColor: "#ffcc00", color: "#16232a" }}
                  onClick={addStickyNote}
                >
                  <MdStickyNote2 className="mr-2 text-xl" /> Sticky Note
                </button>
                <button
                  className="px-6 py-3 rounded-xl font-bold text-white flex items-center hover:scale-105 transition-all shadow-lg active:scale-95"
                  style={{ backgroundColor: "#075056" }}
                  onClick={() => setShowNewNoteModal(true)}
                >
                  <MdAdd className="mr-2 text-xl" /> Create Note
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Filters Modal */}
      <div id="filters-modal" className="hidden fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: "#16232a" }}>Filters</h3>
            <button onClick={() => document.getElementById('filters-modal').classList.add('hidden')}>
              <MdClose className="text-xl hover:opacity-70 transition-all" style={{ color: "#16232a" }} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Priority Filter */}
            <div className="priority-filter-dropdown relative">
              <label className="block text-sm font-medium mb-1" style={{ color: "#16232a" }}>Priority</label>
              <div
                className="w-full border rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer transition-all"
                style={{ borderColor: "#16232a", color: "#16232a", backgroundColor: "#e4eef0" }}
                onClick={() => {
                  setShowDateFilterDropdown(false);
                  setShowPriorityFilterDropdown(!showPriorityFilterDropdown);
                }}
              >
                <span className="capitalize">{filters.priority === 'all' ? 'All Priorities' : filters.priority}</span>
                <MdArrowDropDown className={`text-xl transition-transform ${showPriorityFilterDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showPriorityFilterDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border overflow-hidden" style={{ borderColor: "#16232a" }}>
                  {['all', 'low', 'medium', 'high', 'urgent'].map(option => (
                    <div
                      key={option}
                      className="px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors capitalize text-sm"
                      style={{ color: "#16232a" }}
                      onClick={() => {
                        handleFilterChange('priority', option);
                        setShowPriorityFilterDropdown(false);
                      }}
                    >
                      {option === 'all' ? 'All Priorities' : option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="date-filter-dropdown relative">
              <label className="block text-sm font-medium mb-1" style={{ color: "#16232a" }}>Date Range</label>
              <div
                className="w-full border rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer transition-all"
                style={{ borderColor: "#16232a", color: "#16232a", backgroundColor: "#e4eef0" }}
                onClick={() => {
                  setShowPriorityFilterDropdown(false);
                  setShowDateFilterDropdown(!showDateFilterDropdown);
                }}
              >
                <span>
                  {filters.dateRange === 'all' && 'All Time'}
                  {filters.dateRange === 'today' && 'Today'}
                  {filters.dateRange === 'week' && 'This Week'}
                  {filters.dateRange === 'month' && 'This Month'}
                  {filters.dateRange === 'custom' && 'Custom Range'}
                </span>
                <MdArrowDropDown className={`text-xl transition-transform ${showDateFilterDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showDateFilterDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border overflow-hidden" style={{ borderColor: "#16232a" }}>
                  {[
                    { val: 'all', label: 'All Time' },
                    { val: 'today', label: 'Today' },
                    { val: 'week', label: 'This Week' },
                    { val: 'month', label: 'This Month' },
                    { val: 'custom', label: 'Custom Range' }
                  ].map(option => (
                    <div
                      key={option.val}
                      className="px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors text-sm"
                      style={{ color: "#16232a" }}
                      onClick={() => {
                        handleFilterChange('dateRange', option.val);
                        setShowDateFilterDropdown(false);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filters.dateRange === 'custom' && (
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none transition-all"
                  style={{ borderColor: "#16232a", color: "#16232a", backgroundColor: "#e4eef0" }}
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <input
                  type="date"
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none transition-all"
                  style={{ borderColor: "#16232a", color: "#16232a", backgroundColor: "#e4eef0" }}
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
              style={{ backgroundColor: "#16232a", color: "#e4eef0" }}
              onClick={() => {
                setFilters({
                  shared: 'all',
                  priority: 'all',
                  dateRange: 'all',
                  folderId: 'all'
                });
                setDateRange({ start: '', end: '' });
              }}
            >
              Clear
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-all"
              style={{ backgroundColor: "#ff5b04" }}
              onClick={() => document.getElementById('filters-modal').classList.add('hidden')}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div >


      {/* Create Note Modal */}
      {
        showNewNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl max-h-[85vh] overflow-visible">
              <AddEditNotes
                type="create"
                noteData={null}
                getAllNotes={getAllNotes}
                onClose={() => setShowNewNoteModal(false)}
                showToastMessage={showToastMessage}
                folders={folders}
                onCreateFolder={() => {
                  setNewFolder({ name: '', color: '#075056' });
                  setShowFolderModal(true);
                }}
              />
            </div>
          </div>
        )
      }

      {/* Edit Note Modal */}
      {
        showEditNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl max-h-[85vh] overflow-visible">
              <AddEditNotes
                type="edit"
                noteData={{
                  ...editNote,
                  _id: editNote.id,
                  mediaAttachments: editNote.attachments || [],
                  voiceAttachments: editNote.voiceMemos || [],
                  doodle: editNote.doodles?.[0] || "",
                }}
                getAllNotes={getAllNotes}
                onClose={() => setShowEditNoteModal(false)}
                showToastMessage={showToastMessage}
                folders={folders}
                onCreateFolder={() => {
                  setNewFolder({ name: '', color: '#075056' });
                  setShowFolderModal(true);
                }}
              />
            </div>
          </div>
        )
      }

      {/* Create Folder Modal */}
      {
        showFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ color: "#16232a" }}>Create New Folder</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowFolderModal(false)}
                  >
                    <MdClose size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateFolder}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" style={{ color: "#16232a" }}>Folder Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newFolder.name}
                      onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: "#16232a", backgroundColor: "#e4eef0" }}
                      placeholder="Enter folder name"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1" style={{ color: "#16232a" }}>Folder Color</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="color"
                        value={newFolder.color}
                        onChange={(e) => setNewFolder({ ...newFolder, color: e.target.value })}
                        className="w-10 h-10 border-0 rounded cursor-pointer"
                      />
                      <div
                        className="ml-2 px-3 py-1 rounded"
                        style={{
                          backgroundColor: newFolder.color,
                          color: getContrastColor(newFolder.color)
                        }}
                      >
                        {newFolder.color}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg font-medium"
                      style={{ backgroundColor: "#e4eef0", color: "#16232a", border: "1px solid #16232a" }}
                      onClick={() => setShowFolderModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: "#075056" }}
                      disabled={!newFolder.name.trim()}
                    >
                      Create Folder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Folder Modal */}
      {
        showEditFolderModal && editingFolder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ color: "#16232a" }}>Edit Folder</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowEditFolderModal(false)}
                  >
                    <MdClose size={24} />
                  </button>
                </div>

                <form onSubmit={handleUpdateFolder}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" style={{ color: "#16232a" }}>Folder Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editingFolder.name}
                      onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: "#16232a", backgroundColor: "#e4eef0" }}
                      placeholder="Enter folder name"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1" style={{ color: "#16232a" }}>Folder Color</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="color"
                        value={editingFolder.color}
                        onChange={(e) => setEditingFolder({ ...editingFolder, color: e.target.value })}
                        className="w-10 h-10 border-0 rounded cursor-pointer"
                      />
                      <div
                        className="ml-2 px-3 py-1 rounded"
                        style={{
                          backgroundColor: editingFolder.color,
                          color: getContrastColor(editingFolder.color)
                        }}
                      >
                        {editingFolder.color}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg font-medium"
                      style={{ backgroundColor: "#e4eef0", color: "#16232a", border: "1px solid #16232a" }}
                      onClick={() => setShowEditFolderModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: "#075056" }}
                      disabled={!editingFolder.name.trim()}
                    >
                      Update Folder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Folder Confirmation Modal */}
      {
        showDeleteFolderModal && folderToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ color: "#16232a" }}>Delete Folder</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowDeleteFolderModal(false)}
                  >
                    <MdClose size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <p style={{ color: "#16232a" }}>
                    Are you sure you want to delete the folder "<strong>{folderToDelete.name}</strong>"?
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "#ff5b04" }}>
                    All notes in this folder will be moved to the default folder.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: "#e4eef0", color: "#16232a", border: "1px solid #16232a" }}
                    onClick={() => setShowDeleteFolderModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg font-medium text-white"
                    style={{ backgroundColor: "#ff5b04" }}
                    onClick={confirmDeleteFolder}
                  >
                    Delete Folder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Note Detail Modal */}
      {
        showNoteDetailModal && selectedNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ color: "#16232a" }}>{selectedNote.title}</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowNoteDetailModal(false)}
                  >
                    <MdClose size={24} />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedNote.priority === 'high' || selectedNote.priority === 'urgent' ? 'bg-red-500 text-white' : selectedNote.priority === 'medium' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'}`}>
                      {selectedNote.priority}
                    </span>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: folders.find(f => f.id === selectedNote.folderId)?.color || '#16232a',
                        color: getContrastColor(folders.find(f => f.id === selectedNote.folderId)?.color || '#16232a')
                      }}
                    >
                      {folders.find(f => f.id === selectedNote.folderId)?.name || 'Uncategorized'}
                    </span>
                    {selectedNote.pinned && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                        Pinned
                      </span>
                    )}
                    {selectedNote.shared && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
                        Shared
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="mb-6">
                    <p style={{ color: "#16232a", lineHeight: "1.6" }}>
                      {selectedNote.content}
                    </p>
                  </div>

                  {selectedNote.tags && selectedNote.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-bold mb-2" style={{ color: "#16232a" }}>Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedNote.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: "#e4eef0", color: "#16232a" }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview Attachment (if available) */}
                  {selectedNote.previewAttachment && (
                    <div className="mb-6">
                      <h3 className="font-bold mb-2" style={{ color: "#16232a" }}>
                        {selectedNote.previewType === 'image' ? 'Image Preview' :
                          selectedNote.previewType === 'doodle' ? 'Doodle Preview' :
                            selectedNote.previewType === 'voice' ? 'Voice Memo' :
                              'File Preview'}
                      </h3>
                      <div className="border rounded-lg p-4 flex flex-col items-center" style={{ borderColor: "#16232a" }}>
                        {selectedNote.previewType === 'voice' ? (
                          <div className="w-full">
                            <audio
                              src={selectedNote.previewAttachment}
                              controls
                              className="w-full"
                            />
                          </div>
                        ) : selectedNote.previewType === 'file' ? (
                          selectedNote.previewAttachment.startsWith('data:application/pdf') ? (
                            <iframe
                              src={selectedNote.previewAttachment}
                              className="w-full h-[500px] border rounded"
                              title="PDF Preview"
                            />
                          ) : (
                            <div className="text-center py-8">
                              <p style={{ color: "#16232a" }} className="mb-3">Preview not available for this file type.</p>
                              <a
                                href={selectedNote.previewAttachment}
                                download="download"
                                className="px-4 py-2 rounded text-white inline-flex items-center"
                                style={{ backgroundColor: "#075056" }}
                              >
                                <MdDownload className="mr-2" /> Download File
                              </a>
                            </div>
                          )
                        ) : selectedNote.previewAttachment.startsWith('data:image') ? (
                          <img
                            src={selectedNote.previewAttachment}
                            alt="Preview"
                            className="max-w-full max-h-64 object-contain"
                          />
                        ) : (
                          <div>
                            <p style={{ color: "#16232a" }}>This attachment cannot be previewed.</p>
                            <a
                              href={selectedNote.previewAttachment}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 px-3 py-1 rounded text-sm inline-block"
                              style={{ backgroundColor: "#075056", color: "#e4eef0" }}
                            >
                              Download/Open
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(selectedNote.attachments.length > 0 || selectedNote.fileAttachments.length > 0 || selectedNote.doodles.length > 0 || selectedNote.voiceMemos.length > 0) && (
                    <div>
                      <h3 className="font-bold mb-2" style={{ color: "#16232a" }}>Media</h3>

                      {selectedNote.attachments.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2" style={{ color: "#16232a" }}>Media Attachments</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedNote.attachments.map((attachment, index) => {
                              const isObj = typeof attachment === 'object' && attachment !== null;
                              const data = isObj ? attachment.data : attachment;
                              const name = isObj ? attachment.name : `Media ${index + 1}`;

                              return (
                                <div
                                  key={index}
                                  className="flex items-center px-3 py-1 rounded cursor-pointer"
                                  style={{ backgroundColor: "#e4eef0", color: "#16232a" }}
                                  onClick={() => {
                                    if (data.startsWith('data:image')) {
                                      setSelectedNote({ ...selectedNote, previewAttachment: data, previewType: 'image' });
                                    } else {
                                      // Fallback for video etc if implemented
                                      setSelectedNote({ ...selectedNote, previewAttachment: data, previewType: 'file' });
                                    }
                                  }}
                                >
                                  <MdDownload className="mr-2" size={16} />
                                  <span className="text-sm">{name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedNote.fileAttachments.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2" style={{ color: "#16232a" }}>File Attachments</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedNote.fileAttachments.map((file, index) => {
                              const isObject = typeof file === 'object' && file !== null;
                              const fileData = isObject ? file.data : file;
                              const fileName = isObject ? file.name : `File ${index + 1}`;

                              return (
                                <div
                                  key={index}
                                  className="flex items-center px-3 py-1 rounded cursor-pointer transition-colors hover:bg-opacity-80"
                                  style={{ backgroundColor: "#e4eef0", color: "#16232a" }}
                                  onClick={() => {
                                    setSelectedNote({
                                      ...selectedNote,
                                      previewAttachment: fileData,
                                      previewType: 'file'
                                    });
                                  }}
                                >
                                  <MdAttachFile className="mr-2" size={16} />
                                  <span className="text-sm">{fileName}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedNote.doodles.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2" style={{ color: "#16232a" }}>Doodles</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedNote.doodles.map((doodle, index) => (
                              <div
                                key={index}
                                className="border rounded p-2 cursor-pointer"
                                style={{ borderColor: "#16232a" }}
                                onClick={() => {
                                  if (doodle.startsWith('data:image')) {
                                    // For images, show in modal
                                    setSelectedNote({ ...selectedNote, previewAttachment: doodle, previewType: 'doodle' });
                                  } else {
                                    // For other doodles, open in new tab
                                    const link = document.createElement('a');
                                    link.href = doodle;
                                    link.target = '_blank';
                                    link.click();
                                  }
                                }}
                              >
                                {doodle.startsWith('data:image') ? (
                                  <img
                                    src={doodle}
                                    alt={`Doodle ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                ) : (
                                  <div
                                    className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16"
                                    style={{ borderColor: "#16232a" }}
                                  />
                                )}
                                <span className="text-xs mt-1 block text-center">Doodle {index + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedNote.voiceMemos.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2" style={{ color: "#16232a" }}>Voice Memos</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedNote.voiceMemos.map((memo, index) => (
                              <div
                                key={index}
                                className="flex items-center px-3 py-1 rounded cursor-pointer"
                                style={{ backgroundColor: "#e4eef0", color: "#16232a" }}
                                onClick={() => {
                                  // Show in modal
                                  setSelectedNote({ ...selectedNote, previewAttachment: memo, previewType: 'voice' });
                                }}
                              >
                                <MdAudiotrack className="mr-2" size={16} />
                                <span className="text-sm">Voice {index + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: "#16232a", color: "#e4eef0" }}
                    onClick={() => {
                      setShowNoteDetailModal(false);
                      handleEditNote(selectedNote);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-white"
                    style={{ backgroundColor: "#ff5b04" }}
                    onClick={() => {
                      setShowNoteDetailModal(false);
                      handleDeleteNote(selectedNote.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }


      {/* Sticky Notes Layer */}
      {
        stickyNotes.map(note => (
          <StickyNote
            key={note._id}
            note={note}
            onUpdate={updateStickyNote}
            onDelete={deleteStickyNote}
          />
        ))
      }

      <Toast
        isShown={showToastMsg.show}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </div >
  );
};


export default Dashboard;