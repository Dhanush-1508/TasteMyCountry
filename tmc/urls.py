from django.contrib import admin
from django.urls import path, include
from django.contrib.sitemaps.views import sitemap
from website.sitemaps import StaticViewSitemap


urlpatterns = [
    path('admin/', admin.site.urls),
    path('sitemap.xml', sitemap, {'sitemaps': {'static': StaticViewSitemap}}, name='django.contrib.sitemaps.views.sitemap'),
    path('', include('website.urls')),
]
