from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True)
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    role = models.CharField(max_length=50, default="Client")
    avatar = models.CharField(max_length=255, blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"{self.name} ({self.rating}/5)"

    @property
    def star_display(self):
        filled = max(1, min(5, self.rating))
        return ("★" * filled) + ("☆" * (5 - filled))
