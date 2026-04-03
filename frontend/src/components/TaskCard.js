// src/components/TaskCard.js
import React, { useState } from "react";
import "./TaskCard.css";

export default function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await onDelete(task.id);
    setDeleting(false);
  }

  async function handleToggle() {
    setToggling(true);
    await onToggle(task);
    setToggling(false);
  }

  const createdAt = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <div className={`task-card ${task.completed ? "completed" : ""}`}>
      <div className="task-card-left">
        <button
          className={`task-check ${task.completed ? "checked" : ""} ${toggling ? "checking" : ""}`}
          onClick={handleToggle}
          disabled={toggling}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {toggling ? (
            <span className="mini-spinner" />
          ) : task.completed ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : null}
        </button>
      </div>

      <div className="task-card-body">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          {task.completed && <span className="task-badge done">Completed</span>}
          {!task.completed && <span className="task-badge pending">In Progress</span>}
          {createdAt && <span className="task-date">{createdAt}</span>}
        </div>
      </div>

      <div className="task-card-actions">
        <button className="icon-btn edit" onClick={() => onEdit(task)} title="Edit">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M10.5 1.5l3 3L4 14H1v-3L10.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          className="icon-btn delete"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete"
        >
          {deleting ? (
            <span className="mini-spinner dark" />
          ) : (
            <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
              <path d="M1 3.5h12M5 3.5V2h4v1.5M2 3.5l.75 9.5h8.5L12 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
