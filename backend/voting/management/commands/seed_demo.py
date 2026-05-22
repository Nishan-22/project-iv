from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from voting.models import Candidate, Election, Position

User = get_user_model()


class Command(BaseCommand):
    help = "Create sample admin, voters, election, positions, and candidates."

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@itclub.edu",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "first_name": "Election",
                "last_name": "Committee",
            },
        )
        if not admin.has_usable_password():
            admin.set_password("admin123")
            admin.save()

        voters = []
        for i in (1, 2):
            user, created = User.objects.get_or_create(
                username=f"voter{i}",
                defaults={
                    "email": f"voter{i}@student.edu",
                    "student_id": f"BIT00{i}",
                    "semester": "6",
                    "first_name": f"Student{i}",
                    "last_name": "Sharma",
                    "is_verified": True,
                },
            )
            if created or not user.has_usable_password():
                user.set_password("voter123")
                user.save()
            voters.append(user)

        candidates_users = []
        names = [
            ("alice", "Alice", "President"),
            ("bob", "Bob", "Vice President"),
            ("carol", "Carol", "Secretary"),
            ("dave", "Dave", "General Member"),
            ("eve", "Eve", "General Member"),
        ]
        for username, first, _ in names:
            u, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@student.edu",
                    "first_name": first,
                    "last_name": "Candidate",
                    "student_id": username.upper()[:6],
                    "semester": "6",
                },
            )
            if created or not u.has_usable_password():
                u.set_password("candidate123")
                u.save()
            candidates_users.append(u)

        now = timezone.now()
        election, _ = Election.objects.get_or_create(
            title="IT Club Election 2026",
            defaults={
                "description": "Annual executive committee election for the BIT IT Club.",
                "start_time": now - timedelta(hours=1),
                "end_time": now + timedelta(days=7),
                "status": Election.Status.ACTIVE,
            },
        )

        position_defs = [
            ("President", 1),
            ("Vice President", 1),
            ("Secretary", 1),
            ("General Member", 2),
        ]
        positions = {}
        for name, max_votes in position_defs:
            pos, _ = Position.objects.get_or_create(
                election=election, name=name, defaults={"max_votes": max_votes}
            )
            positions[name] = pos

        mapping = [
            (candidates_users[0], "President"),
            (candidates_users[1], "Vice President"),
            (candidates_users[2], "Secretary"),
            (candidates_users[3], "General Member"),
            (candidates_users[4], "General Member"),
        ]
        for student, pos_name in mapping:
            Candidate.objects.get_or_create(
                election=election,
                position=positions[pos_name],
                student=student,
                defaults={"manifesto": f"I will serve as {pos_name}.", "is_approved": True},
            )

        self.stdout.write(self.style.SUCCESS("Sample data ready."))
        self.stdout.write("Admin: admin / admin123")
        self.stdout.write("Voters: voter1, voter2 / voter123")
