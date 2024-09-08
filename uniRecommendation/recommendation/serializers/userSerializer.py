from rest_framework import serializers
from recommendation.models.user_models import User, Result

class ResultSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=100)
    grade = serializers.CharField(max_length=2)

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    Name = serializers.CharField(max_length=100)
    Year = serializers.IntegerField()
    Stream = serializers.CharField(max_length=100)
    Results = ResultSerializer(many=True)  # List of results
    English = serializers.CharField(max_length=2)
    Preferred_University = serializers.CharField(max_length=50)
    Locations = serializers.ListField(child=serializers.CharField())
    areas = serializers.ListField(child=serializers.CharField())
    Career_Areas = serializers.ListField(child=serializers.CharField())
    duration = serializers.CharField(max_length=50)
    user_id = serializers.CharField(max_length=200)
    created_at = serializers.DateTimeField(read_only=True)  # Read-only field

    def create(self, validated_data):
        results_data = validated_data.pop('Results', [])
        user = User(**validated_data)
        user.save()
        for result_data in results_data:
            result = Result(**result_data)
            user.Results.append(result)
        user.save()
        return user

    def update(self, instance, validated_data):
        results_data = validated_data.pop('Results', [])
        instance.Name = validated_data.get('Name', instance.Name)
        instance.Year = validated_data.get('Year', instance.Year)
        instance.Stream = validated_data.get('Stream', instance.Stream)
        instance.English = validated_data.get('English', instance.English)
        instance.Preferred_University = validated_data.get('Preferred_University', instance.Preferred_University)
        instance.Locations = validated_data.get('Locations', instance.Locations)
        instance.areas = validated_data.get('areas', instance.areas)
        instance.Career_Areas = validated_data.get('Career_Areas', instance.Career_Areas)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.save()
        
        # Directly update the embedded results
        instance.Results.clear()  # Clear existing results
        for result_data in results_data:
            instance.Results.append(Result(**result_data))  # Add new results
        instance.save()
        
        return instance
