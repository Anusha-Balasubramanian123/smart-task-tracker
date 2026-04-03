// src/main/java/com/tasktracker/controller/TaskController.java
package com.tasktracker.controller;

import com.tasktracker.model.Task;
import com.tasktracker.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

   

    // ─── GET /tasks ──────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAllTasks(HttpServletRequest request) {
        String uid = (String) request.getAttribute("uid");
        if (uid == null) return unauthorized();

        try {
            List<Task> tasks = taskService.getTasksByUser(uid);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return serverError("Failed to fetch tasks: " + e.getMessage());
        }
    }

    // ─── POST /tasks ─────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task task,
                                        HttpServletRequest request) {
        String uid = (String) request.getAttribute("uid");
        if (uid == null) return unauthorized();

        if (task.getTitle() == null || task.getTitle().isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Title is required"));
        }

        try {
            Task created = taskService.createTask(uid, task);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return serverError("Failed to create task: " + e.getMessage());
        }
    }

    // ─── PUT /tasks/{id} ─────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable String id,
                                        @RequestBody Task task,
                                        HttpServletRequest request) {
        String uid = (String) request.getAttribute("uid");
        if (uid == null) return unauthorized();

        try {
            Task updated = taskService.updateTask(uid, id, task);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Access denied"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Task not found"));
            }
            return serverError("Failed to update task: " + e.getMessage());
        } catch (Exception e) {
            return serverError("Failed to update task: " + e.getMessage());
        }
    }

    // ─── DELETE /tasks/{id} ──────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id,
                                        HttpServletRequest request) {
        String uid = (String) request.getAttribute("uid");
        if (uid == null) return unauthorized();

        try {
            taskService.deleteTask(uid, id);
            return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Access denied"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Task not found"));
            }
            return serverError("Failed to delete task: " + e.getMessage());
        } catch (Exception e) {
            return serverError("Failed to delete task: " + e.getMessage());
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", "Unauthorized"));
    }

    private ResponseEntity<?> serverError(String message) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", message));
    }
}
