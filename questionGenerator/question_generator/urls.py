from django.urls import path
from .views import GenerateITModelPaperAPIView,SaveUserResponseAPIView,RetrieveUserResponseAPIView,RetrieveUserGeneratedQuestionsAPIView,RetrieveUnansweredQuestionsAPIView,GenerateLawQuestionAPIView,DeletePaperAPIView,RetrieveUserPapersAPIView,RetrieveSingleLawPaperAPIView,DeleteLawQuestionPaperAPIView

urlpatterns = [
    path('generate-ITmodel-paper', GenerateITModelPaperAPIView.as_view(), name='generate-it-model-paper'),
    path('save-response', SaveUserResponseAPIView.as_view(), name='save-response'),
    path('get-response', RetrieveUserResponseAPIView.as_view(), name='get-response'),
    path('get-user-questions', RetrieveUserGeneratedQuestionsAPIView.as_view(), name='get-user-questions'),
    path('get-unanswered-paper',RetrieveUnansweredQuestionsAPIView.as_view(),name='get-unanswered-paper'),
    path('generate-law-lang-paper',GenerateLawQuestionAPIView.as_view(),name='get-unanswered-paper'),
    path('paper-delete', DeletePaperAPIView.as_view(), name='delete_paper'),
    path('retrieve-all-law-papers', RetrieveUserPapersAPIView.as_view(), name='retrieve-all-law-papers'),
    path('retrieve-a-law-paper', RetrieveSingleLawPaperAPIView.as_view(), name='retrieve-a-law-paper'),
    path('law-paper-delete', DeleteLawQuestionPaperAPIView.as_view(), name='law-paper-delete')
]
