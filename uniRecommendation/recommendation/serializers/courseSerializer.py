# recommendation/serializers.py

from rest_framework import serializers
from recommendation.models.course_models import Course, MinimumEligibilityRequirement, University

class MinimumEligibilityRequirementSerializer(serializers.Serializer):
    subjects = serializers.ListField(child=serializers.CharField())
    grade = serializers.CharField(max_length=2)

class UniversitySerializer(serializers.Serializer):
    uni_name = serializers.CharField(max_length=200)
    specializations = serializers.ListField(child=serializers.CharField())
    province = serializers.CharField(max_length=100)
    duration = serializers.CharField(max_length=50)

class CourseSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    stream = serializers.CharField(max_length=100)
    course_name = serializers.CharField(max_length=200)
    course_code = serializers.CharField(max_length=20)
    proposed_intake = serializers.IntegerField()
    minimum_eligibility_requirements = MinimumEligibilityRequirementSerializer(many=True)
    universities = UniversitySerializer(many=True)
    area = serializers.CharField(max_length=100)
    english_requirement = serializers.CharField(max_length=20)
    math_requirement = serializers.CharField(max_length=20)
    science_requirement = serializers.CharField(max_length=20)

    def create(self, validated_data):
        min_eligibility_data = validated_data.pop('minimum_eligibility_requirements', [])
        universities_data = validated_data.pop('universities', [])
        course = Course.objects.create(**validated_data)
        for min_eligibility in min_eligibility_data:
            course.minimum_eligibility_requirements.append(MinimumEligibilityRequirement(**min_eligibility))
        for uni in universities_data:
            course.universities.append(University(**uni))
        course.save()
        return course

    def update(self, instance, validated_data):
        min_eligibility_data = validated_data.pop('minimum_eligibility_requirements', [])
        universities_data = validated_data.pop('universities', [])
        
        instance.stream = validated_data.get('stream', instance.stream)
        instance.course_name = validated_data.get('course_name', instance.course_name)
        instance.course_code = validated_data.get('course_code', instance.course_code)
        instance.proposed_intake = validated_data.get('proposed_intake', instance.proposed_intake)
        instance.area = validated_data.get('area', instance.area)
        instance.english_requirement = validated_data.get('english_requirement', instance.english_requirement)
        instance.math_requirement = validated_data.get('math_requirement', instance.math_requirement)
        instance.science_requirement = validated_data.get('science_requirement', instance.science_requirement)
        
        instance.minimum_eligibility_requirements.clear()
        for min_eligibility in min_eligibility_data:
            instance.minimum_eligibility_requirements.append(MinimumEligibilityRequirement(**min_eligibility))
        
        instance.universities.clear()
        for uni in universities_data:
            instance.universities.append(University(**uni))
        
        instance.save()
        return instance