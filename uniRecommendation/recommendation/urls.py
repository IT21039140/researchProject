from django.urls import path, include
from rest_framework.routers import DefaultRouter
from recommendation.views.courseViews import CourseViewSet
from recommendation.views.userViews import UserViewSet
from recommendation.views.recommendationViews import RecommendationViewSet
from recommendation.views.gnnView import GNNViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet,basename='course')
router.register(r'recommendations', RecommendationViewSet,basename='recommendation')
router.register(r'gnn', GNNViewSet,basename='gnn')

urlpatterns = [
    path('', include(router.urls)),
]