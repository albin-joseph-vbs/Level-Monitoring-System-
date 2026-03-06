from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    register_view,
    forgot_password_view,
    logout_view,
    me_view,
    health_view,
)

urlpatterns = [
    # Auth
    path('login/',           LoginView.as_view(),        name='login'),
    path('register/',        register_view,              name='register'),
    path('forgot-password/', forgot_password_view,       name='forgot-password'),
    path('logout/',          logout_view,                name='logout'),

    # JWT token refresh (get a new access token using refresh token)
    path('token/refresh/',   TokenRefreshView.as_view(), name='token-refresh'),

    # User info
    path('me/',              me_view,                    name='me'),

    # Health
    path('health/',          health_view,                name='health'),
]