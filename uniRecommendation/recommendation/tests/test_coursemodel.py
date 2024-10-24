from django.test import TestCase
from recommendation.models.course_models import Course

class CourseModelTest(TestCase):
    def setUp(self):
        self.course = Course.objects.create(
            course_name="Test Course",
            course_code="TC101",
            proposed_intake="2024",
            minimum_eligibility_requirements="None",
            universities=["University A"],
            area="Engineering",
            duration="4 years"
        )

    def test_course_creation(self):
        """Test that the course is created correctly"""
        self.assertEqual(self.course.course_name, "Test Course")
        self.assertEqual(self.course.course_code, "TC101")
        self.assertEqual(self.course.proposed_intake, "2024")
        self.assertEqual(self.course.minimum_eligibility_requirements, "None")
        self.assertIn("University A", self.course.universities)
        self.assertEqual(self.course.area, "Engineering")
        self.assertEqual(self.course.duration, "4 years")
