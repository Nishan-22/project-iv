from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        VOTER = "voter", "Voter"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.VOTER)
    student_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    semester = models.CharField(max_length=10, blank=True)
    wallet_address = models.CharField(max_length=42, blank=True, null=True, unique=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username


class Election(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        CLOSED = "closed", "Closed"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_open(self):
        now = timezone.now()
        return (
            self.status == self.Status.ACTIVE
            and self.start_time <= now <= self.end_time
        )

    def __str__(self):
        return self.title


class Position(models.Model):
    election = models.ForeignKey(
        Election, on_delete=models.CASCADE, related_name="positions"
    )
    name = models.CharField(max_length=100)
    max_votes = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("election", "name")

    def __str__(self):
        return f"{self.name} ({self.election.title})"


class Candidate(models.Model):
    election = models.ForeignKey(
        Election, on_delete=models.CASCADE, related_name="candidates"
    )
    position = models.ForeignKey(
        Position, on_delete=models.CASCADE, related_name="candidates"
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="candidacies"
    )
    manifesto = models.TextField(blank=True)
    photo = models.ImageField(upload_to="candidates/", blank=True, null=True)
    is_approved = models.BooleanField(default=False)

    class Meta:
        unique_together = ("election", "position", "student")

    def __str__(self):
        return f"{self.student.get_full_name() or self.student.username} - {self.position.name}"


class Vote(models.Model):
    voter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="votes")
    candidate = models.ForeignKey(
        Candidate, on_delete=models.CASCADE, related_name="votes"
    )
    election = models.ForeignKey(
        Election, on_delete=models.CASCADE, related_name="votes"
    )
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["voter", "election", "position"],
                name="one_vote_per_position_per_election",
            )
        ]

    def clean(self):
        if self.candidate.election_id != self.election_id:
            raise ValidationError("Candidate does not belong to this election.")
        if self.candidate.position_id != self.position_id:
            raise ValidationError("Candidate does not belong to this position.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
