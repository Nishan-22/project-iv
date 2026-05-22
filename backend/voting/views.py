from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Candidate, Election, Position, Vote
from .permissions import IsAdmin
from .serializers import (
    CandidateSerializer,
    ElectionSerializer,
    RegisterSerializer,
    ResultItemSerializer,
    UserSerializer,
    VoteCreateSerializer,
    WalletLinkSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class WalletLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = WalletLinkSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.wallet_address = serializer.validated_data["wallet_address"]
        request.user.save(update_fields=["wallet_address"])
        return Response(UserSerializer(request.user).data)


class ElectionListView(generics.ListAPIView):
    queryset = Election.objects.prefetch_related("positions").order_by("-created_at")
    serializer_class = ElectionSerializer
    permission_classes = [IsAuthenticated]


class ElectionDetailView(generics.RetrieveAPIView):
    queryset = Election.objects.prefetch_related("positions")
    serializer_class = ElectionSerializer
    permission_classes = [IsAuthenticated]


class CandidateListView(generics.ListAPIView):
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Candidate.objects.filter(is_approved=True).select_related(
            "student", "position", "election"
        )
        election_id = self.request.query_params.get("election")
        if election_id:
            qs = qs.filter(election_id=election_id)
        position_id = self.request.query_params.get("position")
        if position_id:
            qs = qs.filter(position_id=position_id)
        return qs


class VoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        election_id = serializer.validated_data["election_id"]
        candidate_id = serializer.validated_data["candidate_id"]

        try:
            election = Election.objects.get(pk=election_id)
        except Election.DoesNotExist:
            return Response(
                {"detail": "Election not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not election.is_open():
            return Response(
                {"detail": "Voting is not open for this election."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            candidate = Candidate.objects.select_related("position", "election").get(
                pk=candidate_id, is_approved=True, election=election
            )
        except Candidate.DoesNotExist:
            return Response(
                {"detail": "Candidate not found or not approved."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if Vote.objects.filter(
            voter=request.user,
            election=election,
            position=candidate.position,
        ).exists():
            return Response(
                {"detail": "You have already voted for this position."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Vote.objects.create(
            voter=request.user,
            candidate=candidate,
            election=election,
            position=candidate.position,
        )
        return Response(
            {"detail": "Vote recorded successfully."},
            status=status.HTTP_201_CREATED,
        )


class MyVotesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        election_id = request.query_params.get("election")
        qs = Vote.objects.filter(voter=request.user).select_related(
            "candidate", "position", "election"
        )
        if election_id:
            qs = qs.filter(election_id=election_id)
        data = [
            {
                "election_id": v.election_id,
                "position_id": v.position_id,
                "position_name": v.position.name,
                "candidate_id": v.candidate_id,
                "candidate_name": v.candidate.student.get_full_name()
                or v.candidate.student.username,
            }
            for v in qs
        ]
        return Response(data)


class ResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, election_id):
        try:
            election = Election.objects.get(pk=election_id)
        except Election.DoesNotExist:
            return Response(
                {"detail": "Election not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        rows = (
            Vote.objects.filter(election=election)
            .values(
                "candidate_id",
                "candidate__student__first_name",
                "candidate__student__last_name",
                "candidate__student__username",
                "position_id",
                "position__name",
            )
            .annotate(vote_count=Count("id"))
            .order_by("position__name", "-vote_count")
        )

        results = []
        for row in rows:
            name = (
                f"{row['candidate__student__first_name']} "
                f"{row['candidate__student__last_name']}"
            ).strip() or row["candidate__student__username"]
            results.append(
                {
                    "candidate_id": row["candidate_id"],
                    "candidate_name": name,
                    "position_id": row["position_id"],
                    "position_name": row["position__name"],
                    "vote_count": row["vote_count"],
                }
            )

        serializer = ResultItemSerializer(results, many=True)
        return Response(
            {
                "election": ElectionSerializer(election).data,
                "results": serializer.data,
                "total_votes": Vote.objects.filter(election=election).count(),
            }
        )


class AdminElectionCreateView(generics.CreateAPIView):
    queryset = Election.objects.all()
    serializer_class = ElectionSerializer
    permission_classes = [IsAdmin]


class AdminSetElectionStatusView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, election_id):
        new_status = request.data.get("status")
        valid = {c.value for c in Election.Status}
        if new_status not in valid:
            return Response(
                {"detail": f"status must be one of: {', '.join(valid)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            election = Election.objects.get(pk=election_id)
        except Election.DoesNotExist:
            return Response(
                {"detail": "Election not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        election.status = new_status
        election.save(update_fields=["status"])
        return Response(ElectionSerializer(election).data)
