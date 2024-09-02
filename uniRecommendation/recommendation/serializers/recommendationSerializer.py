from rest_framework import serializers
from recommendation.models.recommendation_model import Recommendation, UserRecommendations

class UserRecommendationsSerializer(serializers.Serializer):
    course_code = serializers.CharField(default="N/A")
    course_name = serializers.CharField(default="N/A")
    university = serializers.CharField(default="N/A")
    specialization = serializers.CharField(default="None")
    duration = serializers.CharField(default="N/A")

class RecommendationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(required=True)
    recommendations = UserRecommendationsSerializer(many=True)

    def create(self, validated_data):
        recommendations_data = validated_data.pop('recommendations', [])
        rec = Recommendation.objects.create(**validated_data)
        for rec_data in recommendations_data:
            user_recommendation = UserRecommendations(**rec_data)
            rec.recommendations.append(user_recommendation)
        rec.save()
        return rec

    def update(self, instance, validated_data):
        recommendations_data = validated_data.get('recommendations', [])
        instance.user_id = validated_data.get('user_id', instance.user_id)
        instance.recommendations = []
        for rec_data in recommendations_data:
            user_recommendation = UserRecommendations(**rec_data)
            instance.recommendations.append(user_recommendation)
        instance.save()
        return instance
