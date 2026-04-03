// src/components/TaskModal.js
import React, { useState, useEffect } from "react";
import "./TaskModal.css";

export default function TaskModal({ task, onClose, onSave, loading }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
    }
  }, [task]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required.");
    setError("");
    onSave({ title: title.trim(), description: description.trim() });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task?.id ? "Edit Task" : "New Task"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {error && <div className="modal-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-field">
            <label>Title <span className="required">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={100}
              autoFocus
            />
          </div>
          <div className="modal-field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)"
              rows={4}
              maxLength={500}
            />
            <span className="char-count">{description.length}/500</span>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : (task?.id ? "Save Changes" : "Create Task")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
