# recommendation/services.py

from recommendation.models.user_models import User
from recommendation.models.course_models import Course


class UserService:
    @staticmethod
    def create_user(data):
        user = User(**data)
        user.save()
        return str(user.id)

    @staticmethod
    def get_user(user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @staticmethod
    def update_user(user_id, data):
        try:
            user = User.objects.get(id=user_id)
            for key, value in data.items():
                setattr(user, key, value)
            user.save()
            return True
        except User.DoesNotExist:
            return False

    @staticmethod
    def delete_user(user_id):
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return True
        except User.DoesNotExist:
            return False

class CourseService:
    @staticmethod
    def create_course(data):
        course = Course(**data)
        course.save()
        return str(course.id)

    @staticmethod
    def get_course(course_id):
        try:
            return Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return None

    @staticmethod
    def update_course(course_id, data):
        try:
            course = Course.objects.get(id=course_id)
            for key, value in data.items():
                setattr(course, key, value)
            course.save()
            return True
        except Course.DoesNotExist:
            return False

    @staticmethod
    def delete_course(course_id):
        try:
            course = Course.objects.get(id=course_id)
            course.delete()
            return True
        except Course.DoesNotExist:
            return False
