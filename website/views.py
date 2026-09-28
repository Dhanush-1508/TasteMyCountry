from django.contrib import messages
from django.shortcuts import redirect, render

from .forms import ReviewForm
from .models import Review


def _approved_reviews():
    return Review.objects.filter(is_approved=True).order_by("created_at", "id")


def home(request):
    return render(
        request,
        "index.html",
        {
            "reviews": _approved_reviews(),
            "review_form": ReviewForm(),
            "show_review_form": False,
        },
    )


def submit_review(request):
    if request.method != "POST":
        return redirect("home")

    form = ReviewForm(request.POST)
    if form.is_valid():
        review = form.save(commit=False)
        review.is_approved = False
        review.role = "Client"
        review.save()
        messages.success(
            request,
            "Thank you. Your review was submitted and will appear after approval.",
        )
        return redirect("home")

    return render(
        request,
        "index.html",
        {
            "reviews": _approved_reviews(),
            "review_form": form,
            "show_review_form": True,
        },
    )
