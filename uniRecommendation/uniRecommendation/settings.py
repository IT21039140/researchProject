
CORS_ALLOW_ALL_ORIGINS = True

from pathlib import Path
from pymongo.errors import ConnectionFailure 

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-f+6+r+$_6(_i4p!e@ofq*droto+w!n!cg#mi$$5+7c$*$f!859"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['34.93.234.163', 'localhost', '127.0.0.1']

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "recommendation",
    "rest_framework",
    'corsheaders',
    
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
     'corsheaders.middleware.CorsMiddleware',
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS',
]

ROOT_URLCONF = "uniRecommendation.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "uniRecommendation.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases




# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
]

# settings.py
import mongoengine
from mongoengine import ConnectionFailure

# MongoDB database configuration
MONGO_DB_NAME = 'Course_Recommendation_System'
MONGODB_URI = 'mongodb+srv://kavindya:12345Vx***@cluster1.twngafi.mongodb.net/Course_Recommendation_System?retryWrites=true&w=majority'

# MongoDB settings for connection
MONGODB_SETTINGS = {
    'db': MONGO_DB_NAME,
    'host': MONGODB_URI,
}

# Establishing the connection to MongoDB
mongoengine.connect(**MONGODB_SETTINGS)

# Secret key (for demonstration purposes, ensure to use a secure method in production)
SECRET_KEY = 'Kavi123'

# Custom function to check MongoDB connection
def check_mongodb_connection():
    try:
        connection = mongoengine.get_connection()
        # Pinging the server to check if the connection is alive
        connection.admin.command('ping')
        print("Successfully connected to MongoDB")
    except ConnectionFailure:
        print("Failed to connect to MongoDB")

# Call the connection check function on startup
if __name__ == "__main__":
    check_mongodb_connection()
