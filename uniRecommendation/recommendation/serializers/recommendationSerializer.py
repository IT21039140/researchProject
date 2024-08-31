from rest_framework import serializers

from recommendation.models.recommendation_model import recommendation

class RecommendationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    course_code = serializers.CharField(default="N/A")
    course_name = serializers.CharField(default="N/A")
    university = serializers.CharField(default="N/A")
    specialization = serializers.CharField(default="None")
    duration = serializers.CharField(default="N/A")
    user_id = serializers.CharField()

    def create(self, validated_data):
        return recommendation.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.course_code = validated_data.get('course_code', instance.course_code)
        instance.course_name = validated_data.get('course_name', instance.course_name)
        instance.university = validated_data.get('university', instance.university)
        instance.specialization = validated_data.get('specialization', instance.specialization)
        instance.duration = f"{validated_data.get('duration', instance.duration)} years"
        instance.save()
        return instance
