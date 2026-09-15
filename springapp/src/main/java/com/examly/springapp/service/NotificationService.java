package com.examly.springapp.service;

import com.examly.springapp.model.Notification;

import java.util.List;

public interface NotificationService {

    Notification createNotification(Notification notification);

    Notification sendNotification(com.examly.springapp.model.User user, String message);

    List<Notification> getNotificationsByUser(Long userId);

    Notification markAsRead(Long notificationId);

    void markAllAsRead(Long userId);
}