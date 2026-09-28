from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "rating",
        "comment_preview",
        "is_approved",
        "created_at",
    )
    list_filter = ("is_approved", "rating", "created_at")
    search_fields = ("name", "email", "comment")
    list_editable = ("is_approved",)
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
    actions = ("approve_reviews",)

    @admin.display(description="Review")
    def comment_preview(self, obj):
        text = obj.comment or ""
        if len(text) > 80:
            return text[:80] + "..."
        return text

    @admin.action(description="Approve selected reviews")
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
