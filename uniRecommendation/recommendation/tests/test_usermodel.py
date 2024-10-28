# test_serializers.py

import os
import unittest
from django.test import TestCase
from mongoengine import connect, disconnect
from mongomock import MongoClient
from recommendation.models.user_models import User, Result
from recommendation.serializers.userSerializer import ResultSerializer, UserSerializer

class ResultSerializerTest(TestCase):

    @classmethod
    def setUpClass(cls):
        # Use mongomock's MongoClient directly
        connect('test_db', host='localhost', mongo_client_class=MongoClient)

    @classmethod
    def tearDownClass(cls):
        disconnect()

    def test_result_serializer_valid(self):
        data = {
            "subject": "Mathematics",
            "grade": "A+",
        }
        serializer = ResultSerializer(data=data)  # Ensure the serializer matches your model
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['subject'], data['subject'])

    def test_result_serializer_invalid(self):
        data = {
            "subject": "",  # Invalid subject
            "grade": "A+",
        }
        serializer = ResultSerializer(data=data)  # Ensure the serializer matches your model
        self.assertFalse(serializer.is_valid())
        self.assertIn('subject', serializer.errors)

class UserSerializerTest(TestCase):

    @classmethod
    def setUpClass(cls):
        # Use mongomock's MongoClient directly
        connect('test_db', host='localhost', mongo_client_class=MongoClient)

    @classmethod
    def tearDownClass(cls):
        disconnect()

    def setUp(self):
        User.drop_collection()  # Clear the collection before each test

    def test_user_serializer_create(self):
        data = {
            "Name": "John Doe",
            "Year": "3",  # Ensure this is a string if using StringField
            "Stream": "Science",
            "Results": [
                {
                    "subject": "Mathematics",
                    "grade": "A+",
                },
                {
                    "subject": "Physics",
                    "grade": "B",
                }
            ],
            "English": "A",
            "Preferred_University": "University of Colombo",
            "Locations": ["Colombo", "Kandy"],
            "areas": ["Engineering", "Science"],
            "Career_Areas": ["Software Engineering", "Data Science"],
            "duration": "4 years",
            "user_id": "user_123",
        }
        serializer = UserSerializer(data=data)  # Ensure the serializer matches your model
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.Name, data['Name'])
        self.assertEqual(user.Year, data['Year'])
        self.assertEqual(len(user.Results), 2)

    def test_user_serializer_update(self):
        user = User(
            Name="Jane Doe",
            Year="2",  # Ensure this is a string if using StringField
            Stream="Arts",
            English="B",
            Preferred_University="University of Colombo",
            Locations=["Colombo"],
            areas=["Arts"],
            Career_Areas=["Graphic Design"],
            duration="3 years",
            user_id="user_456",
            Results=[Result(subject="History", grade="B+")]  # EmbeddedDocument usage
        )
        user.save()

        updated_data = {
            "Name": "Jane Smith",
            "Year": "3",  # Ensure this is a string if using StringField
            "Stream": "Commerce",
            "Results": [
                {
                    "subject": "Business Studies",
                    "grade": "A",
                },
                {
                    "subject": "Economics",
                    "grade": "A-",
                }
            ],
            "English": "A",
            "Preferred_University": "University of Colombo",
            "Locations": ["Colombo", "Galle"],
            "areas": ["Commerce"],
            "Career_Areas": ["Finance", "Marketing"],
            "duration": "4 years",
        }
        serializer = UserSerializer(instance=user, data=updated_data)  # Ensure the serializer matches your model
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()
        self.assertEqual(updated_user.Name, updated_data['Name'])
        self.assertEqual(updated_user.Year, updated_data['Year'])
        self.assertEqual(len(updated_user.Results), 2)  # Check that results have been updated

if __name__ == '__main__':
    unittest.main()
