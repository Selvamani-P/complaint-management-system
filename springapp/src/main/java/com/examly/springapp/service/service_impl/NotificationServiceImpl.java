package com.examly.springapp.service.service_impl;

import com.examly.springapp.model.Notification;
import com.examly.springapp.repository.NotificationRepository;
import com.examly.springapp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public Notification createNotification(
            Notification notification) {

        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getNotificationsByUser(
            Long userId) {

        return notificationRepository.findByUserId(userId);
    }

    @Override
    public Notification markAsRead(
            Long notificationId) {

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"));

        notification.setRead(true);

        return notificationRepository.save(notification);
    }
}