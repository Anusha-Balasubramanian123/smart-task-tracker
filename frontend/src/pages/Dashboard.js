// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { taskService } from "../services/taskService";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import "./Dashboard.css";

const FILTERS = ["All", "In Progress", "Completed"];

export default function Dashboard() {
  const { currentUser, logout, getIdToken } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getIdToken();
      const data = await taskService.getAllTasks(token);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load tasks. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function handleSave(taskData) {
    setSaving(true);
    setError("");
    try {
      const token = await getIdToken();
      if (editingTask?.id) {
        const updated = await taskService.updateTask(token, editingTask.id, {
          ...editingTask, ...taskData
        });
        setTasks((prev) => prev.map((t) => t.id === editingTask.id ? updated : t));
      } else {
        const created = await taskService.createTask(token, {
          ...taskData, completed: false, createdAt: Date.now()
        });
        setTasks((prev) => [created, ...prev]);
      }
      closeModal();
    } catch {
      setError("Failed to save task.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      const token = await getIdToken();
      await taskService.deleteTask(token, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete task.");
    }
  }

  async function handleToggle(task) {
    setError("");
    try {
      const token = await getIdToken();
      const updated = await taskService.updateTask(token, task.id, {
        ...task, completed: !task.completed
      });
      setTasks((prev) => prev.map((t) => t.id === task.id ? updated : t));
    } catch {
      setError("Failed to update task.");
    }
  }

  function openCreate() { setEditingTask(null); setModalOpen(true); }
  function openEdit(task) { setEditingTask(task); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingTask(null); }

  const filteredTasks = tasks.filter((t) => {
    const matchFilter =
      filter === "All" || (filter === "Completed" && t.completed) || (filter === "In Progress" && !t.completed);
    const matchSearch =
      !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalCount = tasks.length;
  const doneCount = tasks.filter((t) => t.completed).length;
  const progressPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="dashboard">
      <nav className="dash-nav">
        <div className="nav-brand">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="url(#nav-grad)" />
            <path d="M10 18l5 5 11-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="nav-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6C63FF"/><stop offset="1" stopColor="#3ECFCF"/>
              </linearGradient>
            </defs>
          </svg>
          <span>TaskFlow</span>
        </div>
        <div className="nav-user">
          <span className="user-email">{currentUser?.email}</span>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </nav>

      <main className="dash-main">
        <div className="dash-hero">
          <div>
            <h1 className="dash-title">My Tasks</h1>
            <p className="dash-sub">{totalCount === 0 ? "No tasks yet. Create your first one!" : `${doneCount} of ${totalCount} completed`}</p>
          </div>
          <button className="create-btn" onClick={openCreate}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Task
          </button>
        </div>

        {totalCount > 0 && (
          <div className="progress-bar-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="progress-label">{progressPct}%</span>
          </div>
        )}

        <div className="dash-controls">
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
                {f === "All" && <span className="tab-count">{totalCount}</span>}
                {f === "In Progress" && <span className="tab-count">{totalCount - doneCount}</span>}
                {f === "Completed" && <span className="tab-count">{doneCount}</span>}
              </button>
            ))}
          </div>
          <div className="search-wrap">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="dash-error">
            <span>⚠</span> {error}
            <button onClick={fetchTasks} className="retry-btn">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {search ? "🔍" : filter === "Completed" ? "🎉" : "📋"}
            </div>
            <h3>{search ? "No tasks match your search" : filter === "Completed" ? "No completed tasks yet" : filter === "In Progress" ? "All caught up!" : "No tasks yet"}</h3>
            <p>{search ? "Try a different keyword." : "Create a new task to get started."}</p>
            {!search && filter === "All" && (
              <button className="create-btn small" onClick={openCreate}>Create your first task</button>
            )}
          </div>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={closeModal}
          onSave={handleSave}
          loading={saving}
        />
      )}
    </div>
  );
}
