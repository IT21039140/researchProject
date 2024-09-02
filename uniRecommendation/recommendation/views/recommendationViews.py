from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.decorators import action
from recommendation.models.recommendation_model import Recommendation, UserRecommendations
from recommendation.serializers.recommendationSerializer import RecommendationSerializer

class RecommendationViewSet(viewsets.ModelViewSet):
    serializer_class = RecommendationSerializer

    def get_queryset(self):
        return Recommendation.objects.all()

    def list(self, request):
        queryset = self.get_queryset()
        if not queryset:
            raise NotFound(detail="No recommendations found")
        serializer = RecommendationSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        rec = Recommendation.objects.filter(id=pk).first()
        if rec:
            serializer = RecommendationSerializer(rec)
            return Response(serializer.data)
        return Response({'error': 'Recommendation not found'}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = RecommendationSerializer(data=request.data)
        if serializer.is_valid():
            rec = serializer.save()
            return Response(RecommendationSerializer(rec).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put'], url_path='update-by-user/(?P<user_id>[^/.]+)')
    def update_by_user_id(self, request, user_id=None):
        recommendations_data = request.data.get('recommendations', [])
        rec = Recommendation.objects.filter(user_id=user_id).first()
        if rec:
            rec.recommendations = []
            for rec_data in recommendations_data:
                user_recommendation = UserRecommendations(**rec_data)
                rec.recommendations.append(user_recommendation)
            rec.save()
            serializer = RecommendationSerializer(rec)
            return Response(serializer.data)
        return Response({'error': 'Recommendation not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'], url_path='delete-by-user/(?P<user_id>[^/.]+)')
    def delete_by_user_id(self, request, user_id=None):
        rec = Recommendation.objects.filter(user_id=user_id).first()
        if rec:
            rec.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'Recommendation not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='get-by-user/(?P<user_id>[^/.]+)')
    def get_by_user_id(self, request, user_id=None):
        rec = Recommendation.objects.filter(user_id=user_id).first()
        if rec:
            serializer = RecommendationSerializer(rec)
            return Response(serializer.data)
        return Response({'error': 'Recommendation not found'}, status=status.HTTP_404_NOT_FOUND)
