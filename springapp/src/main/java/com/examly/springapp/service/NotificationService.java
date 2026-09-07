package com.examly.springapp.service;

import com.examly.springapp.model.Notification;

import java.util.Optional;

public interface NotificationService {

    Notification createNotification(Notification notification);

    Optional<Notification> getNotificationsByUser(Long userId);

    Notification markAsRead(Long notificationId);
}