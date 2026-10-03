from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("api.urls")),
]

# Serve uploaded media files — in production Render uses the filesystem within
# the same process, so this is required for media_url resolution to work.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

