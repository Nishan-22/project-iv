from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", views.MeView.as_view(), name="me"),
    path("auth/wallet/", views.WalletLinkView.as_view(), name="wallet_link"),
    path("elections/", views.ElectionListView.as_view(), name="election_list"),
    path("elections/<int:pk>/", views.ElectionDetailView.as_view(), name="election_detail"),
    path("candidates/", views.CandidateListView.as_view(), name="candidate_list"),
    path("votes/", views.VoteView.as_view(), name="vote"),
    path("votes/mine/", views.MyVotesView.as_view(), name="my_votes"),
    path("results/<int:election_id>/", views.ResultsView.as_view(), name="results"),
    path("admin/elections/", views.AdminElectionCreateView.as_view(), name="admin_election_create"),
    path(
        "admin/elections/<int:election_id>/status/",
        views.AdminSetElectionStatusView.as_view(),
        name="admin_election_status",
    ),
]
