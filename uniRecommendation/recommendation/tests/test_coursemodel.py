import unittest
from mongoengine import connect, disconnect, ValidationError
from mongomock import MongoClient  # Import MongoClient from mongomock
from recommendation.models.course_models import Course, MinimumEligibilityRequirement, University  # Adjust import based on your app structure

class TestCourseModel(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Use mongomock's MongoClient directly
        connect('test_db', host='localhost', mongo_client_class=MongoClient)

    @classmethod
    def tearDownClass(cls):
        disconnect()

    def setUp(self):
        Course.drop_collection()  # Clear the collection before each test

    def test_create_course(self):
        # Correctly create MinimumEligibilityRequirement instances
        minimum_eligibility1 = MinimumEligibilityRequirement(subjects=['Mathematics', 'English'], grade='A')
        minimum_eligibility2 = MinimumEligibilityRequirement(subjects=['Science', 'Mathematics'], grade='B')

        university = University(
            uni_name='University of Colombo',
            specializations=['Engineering', 'Science'],
            province='Western',
            location='Colombo',
            duration='4 Years',
            degree_offered='BSc',
            medium='English'
        )

        course = Course(
            stream='Science',
            course_name='Computer Science',
            course_code='CS101',
            proposed_intake=2025,
            minimum_eligibility_requirements=[minimum_eligibility1, minimum_eligibility2],
            universities=[university],
            area='Information Technology',
            english_requirement='C',
            math_requirement='B',
            science_requirement='B',
            important_note='N/A',
            guidance_and_information='Check website for details.',
            additional_requirements=['Interview']
        )
        course.save()
        self.assertEqual(course.course_name, 'Computer Science')

    def test_field_validations(self):
        with self.assertRaises(ValidationError):
            course = Course(
                stream='Science',
                course_name='A' * 201,  # Exceeds max length of 200
                course_code='CS101',
                proposed_intake=2025,
                minimum_eligibility_requirements=[],
                universities=[],
                area='Information Technology',
                english_requirement='C',
                math_requirement='B',
                science_requirement='B'
            )
            course.save()

    def test_string_representation(self):
        course = Course(course_name='Physics')
        course.save()  # Save the course before checking the string representation
        self.assertEqual(str(course), 'Physics')  # Update as necessary based on your __str__ implementation

if __name__ == '__main__':
    unittest.main()
