from django.db import migrations


def seed_reviews(apps, schema_editor):
    Review = apps.get_model("website", "Review")
    if Review.objects.exists():
        return

    Review.objects.bulk_create(
        [
            Review(
                name="Naren K",
                rating=5,
                comment=(
                    "Great experience with DK Digital Services! "
                    "Professional team, quick support, and creative "
                    "digital marketing solutions."
                ),
                role="Client",
                avatar="img/photos/testi-01.png",
                is_approved=True,
            ),
            Review(
                name="Balaji Sekar",
                rating=5,
                comment=(
                    "I am very happy with DK Digital marketing "
                    "services. Good output comes in my business "
                    "for past more than 1 year."
                ),
                role="Client",
                avatar="img/photos/testi-02.png",
                is_approved=True,
            ),
            Review(
                name="Rajesh Kumar",
                rating=5,
                comment=(
                    "I'm really impressed with the website design "
                    "and template theme. Satisfied with their service. "
                    "Will definitely recommend my business partners."
                ),
                role="Client",
                avatar="img/photos/testi-03.png",
                is_approved=True,
            ),
            Review(
                name="Vijayalakshmi",
                rating=5,
                comment=(
                    "I had a very good experience with DK Digital "
                    "Service. They understood my requirements clearly "
                    "and delivered a professional and user-friendly "
                    "website."
                ),
                role="Client",
                avatar="img/photos/testi-04.png",
                is_approved=True,
            ),
            Review(
                name="Surya",
                rating=5,
                comment=(
                    "Excellent service and very professional approach. "
                    "DK Digital Service by Dinesh offers excellent and "
                    "reliable service. Highly recommended."
                ),
                role="Client",
                avatar="img/photos/testi-05.png",
                is_approved=True,
            ),
        ]
    )


def unseed_reviews(apps, schema_editor):
    Review = apps.get_model("website", "Review")
    Review.objects.filter(
        name__in=["Naren K", "Balaji Sekar", "Rajesh Kumar", "Vijayalakshmi", "Surya"]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("website", "0001_review_model"),
    ]

    operations = [
        migrations.RunPython(seed_reviews, unseed_reviews),
    ]
