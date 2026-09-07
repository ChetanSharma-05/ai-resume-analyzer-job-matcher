from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')

    def test_register_creates_user_with_default_role(self):
        response = self.client.post(self.register_url, {
            "username": "testuser",
            "email": "test@example.com",
            "password": "strongpassword123",
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_rejects_short_password(self):
        response = self.client.post(self.register_url, {
            "username": "testuser2",
            "email": "test2@example.com",
            "password": "short",
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_tokens(self):
        self.client.post(self.register_url, {
            "username": "loginuser",
            "email": "login@example.com",
            "password": "strongpassword123",
        })
        response = self.client.post(self.login_url, {
            "email": "login@example.com",
            "password": "strongpassword123",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_fails_with_wrong_password(self):
        self.client.post(self.register_url, {
            "username": "wronguser",
            "email": "wrong@example.com",
            "password": "strongpassword123",
        })
        response = self.client.post(self.login_url, {
            "email": "wrong@example.com",
            "password": "incorrectpassword",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
