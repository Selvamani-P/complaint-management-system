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
    public Notification sendNotification(com.examly.springapp.model.User user, String message) {
        if (user == null) return null;
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getNotificationsByUser(
            Long userId) {

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public Notification markAsRead(
            Long notificationId) {

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new com.examly.springapp.exception.ResourceNotFoundException(
                                        "Notification not found with ID: " + notificationId));

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> userNotifications = notificationRepository.findByUserId(userId);
        for (Notification n : userNotifications) {
            n.setRead(true);
        }
        notificationRepository.saveAll(userNotifications);
    }
}