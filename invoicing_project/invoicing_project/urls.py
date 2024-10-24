from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from invoices.views import InvoiceViewSet

router = routers.DefaultRouter()
router.register(r'invoices', InvoiceViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
