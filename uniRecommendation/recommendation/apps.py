from django.apps import AppConfig

import mongoengine

class RecommendationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'recommendation'

    def ready(self):
        from django.conf import settings
        mongoengine.connect(**settings.MONGODB_SETTINGS)
