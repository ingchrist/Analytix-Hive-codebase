# apps/payments/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Wallet

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    """Create wallet for new users"""
    if created:
        Wallet.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_wallet(sender, instance, **kwargs):
    """Save user wallet when user is saved"""
    try:
        instance.wallet.save()
    except Wallet.DoesNotExist:
        # Create wallet if it doesn't exist
        Wallet.objects.create(user=instance)

