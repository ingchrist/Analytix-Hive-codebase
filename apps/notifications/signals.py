from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.courses.models import Enrollment, Course, Review
from apps.payments.models import Payment
from apps.chat.models import Message
from .utils import send_notification

User = get_user_model()


@receiver(post_save, sender=Enrollment)
def notify_enrollment(sender, instance, created, **kwargs):
    """Notify instructor when someone enrolls in their course"""
    if created:
        send_notification(
            recipient=instance.course.instructor,
            title="New Enrollment",
            message=f"{instance.student.get_full_name()} enrolled in {instance.course.title}",
            priority='normal',
            action_url=f"/courses/{instance.course.slug}/students/",
            content_object=instance
        )
        
        # Welcome notification to student
        send_notification(
            recipient=instance.student,
            title="Welcome to the Course!",
            message=f"You've successfully enrolled in {instance.course.title}. Start learning now!",
            priority='normal',
            action_url=f"/courses/{instance.course.slug}/",
            content_object=instance
        )


@receiver(post_save, sender=Review)
def notify_review(sender, instance, created, **kwargs):
    """Notify instructor about new reviews"""
    if created:
        send_notification(
            recipient=instance.course.instructor,
            title="New Course Review",
            message=f"{instance.student.get_full_name()} left a {instance.rating}-star review on {instance.course.title}",
            priority='normal',
            action_url=f"/courses/{instance.course.slug}/reviews/",
            content_object=instance
        )


@receiver(post_save, sender=Payment)
def notify_payment(sender, instance, **kwargs):
    """Notify about payment status"""
    if instance.transaction.status == 'success':
        send_notification(
            recipient=instance.transaction.user,
            title="Payment Successful",
            message=f"Your payment for {instance.course.title} has been processed successfully.",
            priority='high',
            action_url=f"/courses/{instance.course.slug}/",
            content_object=instance
        )


@receiver(post_save, sender=Message)
def notify_chat_message(sender, instance, created, **kwargs):
    """Notify chat room members about new messages"""
    if created and instance.room.room_type == 'direct':
        # For direct messages, notify the other user
        other_members = instance.room.members.exclude(id=instance.sender.id)
        for member in other_members:
            send_notification(
                recipient=member,
                title=f"New message from {instance.sender.get_full_name()}",
                message=instance.content[:100] + "..." if len(instance.content) > 100 else instance.content,
                priority='normal',
                action_url=f"/chat/rooms/{instance.room.id}/",
                content_object=instance
            )


@receiver(post_save, sender=User)
def create_notification_preferences(sender, instance, created, **kwargs):
    """Create default notification preferences for new users"""
    if created:
        from .models import NotificationPreference
        NotificationPreference.objects.create(user=instance)

