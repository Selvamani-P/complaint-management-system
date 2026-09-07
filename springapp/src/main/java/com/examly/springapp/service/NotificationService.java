package com.examly.springapp.service;

import com.examly.springapp.model.Notification;

import java.util.List;

public interface NotificationService {

    Notification createNotification(Notification notification);

    List<Notification> getNotificationsByUser(Long userId);

    Notification markAsRead(Long notificationId);
}