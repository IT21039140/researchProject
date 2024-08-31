from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from recommendation.models.course_models import Course
from recommendation.serializers.courseSerializer import CourseSerializer

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer

    def get_queryset(self):
        # Return the queryset without checking if it exists
        return Course.objects.all()

    def list(self, request):
        queryset = self.get_queryset()
        if not queryset:  # Check for empty queryset
            raise NotFound(detail="No courses found")
        serializer = CourseSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        course = Course.objects.filter(id=pk).first()
        if course:
            serializer = CourseSerializer(course)
            return Response(serializer.data)
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        course = Course.objects.filter(id=pk).first()
        if course:
            serializer = CourseSerializer(course, data=request.data, partial=True)
            if serializer.is_valid():
                updated_course = serializer.save()
                return Response(CourseSerializer(updated_course).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        course = Course.objects.filter(id=pk).first()
        if course:
            course.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
