from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from recommendation.models.recommendation_model import recommendation
from recommendation.serializers.recommendationSerializer import RecommendationSerializer

class RecommendationViewSet(viewsets.ModelViewSet):
    serializer_class = RecommendationSerializer

    def get_queryset(self):
        # Return the queryset without checking if it exists
        return recommendation.objects.all()

    def list(self, request):
        queryset = self.get_queryset()
        if not queryset:  # Check for empty queryset
            raise NotFound(detail="No recommendations found")
        serializer = RecommendationSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        recommendation = recommendation.objects.filter(id=pk).first()
        if recommendation:
            serializer = RecommendationSerializer(recommendation)
            return Response(serializer.data)
        return Response({'error': 'recommendation not found'}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = RecommendationSerializer(data=request.data)
        if serializer.is_valid():
            recommendation = serializer.save()
            return Response(RecommendationSerializer(recommendation).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        recommendation = recommendation.objects.filter(id=pk).first()
        if recommendation:
            serializer = RecommendationSerializer(recommendation, data=request.data, partial=True)
            if serializer.is_valid():
                updated_recommendation = serializer.save()
                return Response(RecommendationSerializer(updated_recommendation).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'recommendation not found'}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        recommendation = recommendation.objects.filter(id=pk).first()
        if recommendation:
            recommendation.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'recommendation not found'}, status=status.HTTP_404_NOT_FOUND)
