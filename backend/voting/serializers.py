from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Candidate, Election, Position, Vote

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "student_id",
            "semester",
        )

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data, role=User.Role.VOTER)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "student_id",
            "semester",
            "wallet_address",
            "is_verified",
        )
        read_only_fields = ("role", "is_verified")


class WalletLinkSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)

    def validate_wallet_address(self, value):
        if not value.startswith("0x") or len(value) != 42:
            raise serializers.ValidationError("Invalid Ethereum wallet address.")
        qs = User.objects.filter(wallet_address__iexact=value).exclude(
            pk=self.context["request"].user.pk
        )
        if qs.exists():
            raise serializers.ValidationError("Wallet already linked to another account.")
        return value


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ("id", "name", "max_votes", "election")


class ElectionSerializer(serializers.ModelSerializer):
    positions = PositionSerializer(many=True, read_only=True)
    is_open = serializers.SerializerMethodField()

    class Meta:
        model = Election
        fields = (
            "id",
            "title",
            "description",
            "start_time",
            "end_time",
            "status",
            "is_open",
            "positions",
            "created_at",
        )

    def get_is_open(self, obj):
        return obj.is_open()


class CandidateSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    position_name = serializers.CharField(source="position.name", read_only=True)

    class Meta:
        model = Candidate
        fields = (
            "id",
            "election",
            "position",
            "position_name",
            "student",
            "student_name",
            "manifesto",
            "photo",
            "is_approved",
        )
        read_only_fields = ("student", "is_approved")

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username


class VoteCreateSerializer(serializers.Serializer):
    election_id = serializers.IntegerField()
    candidate_id = serializers.IntegerField()


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ("id", "voter", "candidate", "election", "position", "created_at")
        read_only_fields = fields


class ResultItemSerializer(serializers.Serializer):
    candidate_id = serializers.IntegerField()
    candidate_name = serializers.CharField()
    position_id = serializers.IntegerField()
    position_name = serializers.CharField()
    vote_count = serializers.IntegerField()
