package com.examly.springapp.controller;

import com.examly.springapp.model.Notification;
import com.examly.springapp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public Notification createNotification(
            @RequestBody Notification notification) {

        return notificationService.createNotification(notification);
    }

    @GetMapping("/user/{userId}")
    public Optional<Notification> getNotifications(
            @PathVariable Long userId) {

        return notificationService
                .getNotificationsByUser(userId);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(
            @PathVariable Long id) {

        return notificationService.markAsRead(id);
    }
}