from rest_framework.routers import DefaultRouter
from .views import CalendarEventViewSet

router = DefaultRouter()
router.register(r"events", CalendarEventViewSet)

urlpatterns = router.urls
