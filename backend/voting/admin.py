from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Candidate, Election, Position, User, Vote


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "student_id", "wallet_address", "is_verified")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Club voting", {"fields": ("role", "student_id", "semester", "wallet_address", "is_verified")}),
    )


@admin.register(Election)
class ElectionAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "start_time", "end_time")


class PositionInline(admin.TabularInline):
    model = Position
    extra = 1


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ("name", "election", "max_votes")


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ("student", "position", "election", "is_approved")
    list_filter = ("is_approved", "election")


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ("voter", "candidate", "election", "position", "created_at")
    readonly_fields = ("created_at",)
