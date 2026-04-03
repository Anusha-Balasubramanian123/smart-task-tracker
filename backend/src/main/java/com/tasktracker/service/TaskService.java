// src/main/java/com/tasktracker/service/TaskService.java
package com.tasktracker.service;

import com.google.firebase.database.*;
import com.tasktracker.model.Task;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class TaskService {

    private final DatabaseReference db;

    public TaskService() {
        this.db = FirebaseDatabase.getInstance().getReference("tasks");
    }

    // ─── GET ALL tasks for a user ────────────────────────────────────────────
    public List<Task> getTasksByUser(String userId) throws Exception {
        CompletableFuture<List<Task>> future = new CompletableFuture<>();

        db.orderByChild("userId").equalTo(userId)
            .addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    List<Task> tasks = new ArrayList<>();
                    for (DataSnapshot child : snapshot.getChildren()) {
                        Task task = snapshotToTask(child);
                        if (task != null) tasks.add(task);
                    }
                    // Sort by createdAt descending (newest first)
                    tasks.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));
                    future.complete(tasks);
                }
                @Override
                public void onCancelled(DatabaseError error) {
                    future.completeExceptionally(new RuntimeException(error.getMessage()));
                }
            });

        return future.get();
    }

    // ─── CREATE a task ───────────────────────────────────────────────────────
    public Task createTask(String userId, Task task) throws Exception {
        String id = db.push().getKey();
        if (id == null) throw new RuntimeException("Failed to generate task ID");

        task.setId(id);
        task.setUserId(userId);
        task.setCreatedAt(System.currentTimeMillis());
        task.setUpdatedAt(System.currentTimeMillis());

        CompletableFuture<Void> future = new CompletableFuture<>();
        db.child(id).setValue(taskToMap(task), (error, ref) -> {
            if (error != null) future.completeExceptionally(new RuntimeException(error.getMessage()));
            else future.complete(null);
        });
        future.get();
        return task;
    }

    // ─── UPDATE a task ───────────────────────────────────────────────────────
    public Task updateTask(String userId, String taskId, Task updates) throws Exception {
        // First verify the task belongs to this user
        Task existing = getTaskById(taskId);
        if (existing == null) throw new RuntimeException("Task not found");
        if (!existing.getUserId().equals(userId)) throw new SecurityException("Access denied");

        existing.setTitle(updates.getTitle() != null ? updates.getTitle() : existing.getTitle());
        existing.setDescription(updates.getDescription() != null ? updates.getDescription() : existing.getDescription());
        existing.setCompleted(updates.isCompleted());
        existing.setUpdatedAt(System.currentTimeMillis());

        CompletableFuture<Void> future = new CompletableFuture<>();
        db.child(taskId).setValue(taskToMap(existing), (error, ref) -> {
            if (error != null) future.completeExceptionally(new RuntimeException(error.getMessage()));
            else future.complete(null);
        });
        future.get();
        return existing;
    }

    // ─── DELETE a task ───────────────────────────────────────────────────────
    public void deleteTask(String userId, String taskId) throws Exception {
        Task existing = getTaskById(taskId);
        if (existing == null) throw new RuntimeException("Task not found");
        if (!existing.getUserId().equals(userId)) throw new SecurityException("Access denied");

        CompletableFuture<Void> future = new CompletableFuture<>();
        db.child(taskId).removeValue((error, ref) -> {
            if (error != null) future.completeExceptionally(new RuntimeException(error.getMessage()));
            else future.complete(null);
        });
        future.get();
    }

    // ─── Helper: fetch single task by ID ────────────────────────────────────
    private Task getTaskById(String taskId) throws Exception {
        CompletableFuture<Task> future = new CompletableFuture<>();
        db.child(taskId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                future.complete(snapshotToTask(snapshot));
            }
            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(new RuntimeException(error.getMessage()));
            }
        });
        return future.get();
    }

    // ─── Helper: DataSnapshot → Task ────────────────────────────────────────
    private Task snapshotToTask(DataSnapshot snapshot) {
        if (!snapshot.exists()) return null;
        try {
            Task t = new Task();
            t.setId(snapshot.getKey());
            t.setUserId(getStr(snapshot, "userId"));
            t.setTitle(getStr(snapshot, "title"));
            t.setDescription(getStr(snapshot, "description"));
            t.setCompleted(Boolean.TRUE.equals(snapshot.child("completed").getValue(Boolean.class)));
            Long createdAt = snapshot.child("createdAt").getValue(Long.class);
            Long updatedAt = snapshot.child("updatedAt").getValue(Long.class);
            t.setCreatedAt(createdAt != null ? createdAt : 0L);
            t.setUpdatedAt(updatedAt != null ? updatedAt : 0L);
            return t;
        } catch (Exception e) {
            return null;
        }
    }

    private String getStr(DataSnapshot snapshot, String key) {
        Object val = snapshot.child(key).getValue();
        return val != null ? val.toString() : "";
    }

    // ─── Helper: Task → Map ──────────────────────────────────────────────────
    private Map<String, Object> taskToMap(Task task) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", task.getId());
        map.put("userId", task.getUserId());
        map.put("title", task.getTitle());
        map.put("description", task.getDescription() != null ? task.getDescription() : "");
        map.put("completed", task.isCompleted());
        map.put("createdAt", task.getCreatedAt());
        map.put("updatedAt", task.getUpdatedAt());
        return map;
    }
}
