from django.contrib import admin
from django.urls import path, include
from django.contrib.sitemaps.views import sitemap

from website.sitemaps import StaticViewSitemap
from website.views import robots_txt


urlpatterns = [
    path('admin/', admin.site.urls),

    path(
        'sitemap.xml',
        sitemap,
        {'sitemaps': {'static': StaticViewSitemap}},
        name='django.contrib.sitemaps.views.sitemap',
    ),

    path('robots.txt', robots_txt, name='robots_txt'),

    path('', include('website.urls')),
]