# from django.core.exceptions import ValidationError
# from django.core.validators import EmailValidator, validate_email
# from django.db import models
# from django.contrib import admin
# from .models import Email


# # Create your models here.
# EMAIL_CATEGORIES = [
#     ('inbox', 'Inbox'),
#     ('starred', 'Starred'),
#     ('important', 'Important'),
#     ('draft', 'Draft'),
#     ('sent', 'Sent'),
#     ('trash', 'Trash'),
# ]

# class EmailAdmin(admin.ModelAdmin):
#     list_display = ('email_address', 'subject', 'category', 'timestamp')
#     list_filter = ('category',)
#     search_fields = ('email_address', 'subject')

# #Add a class containing composed fields for the email
# class Email(models.Model):
#     email = models.EmailField(verbose_name="Email", max_length=254, unique=True)
#     subject = models.CharField(max_length=500)
#     message = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    

#     def clean(self):
#         super(Email, self).clean()
#         # Custom validation for email
#         try:
#             validate_email(self.email)
#         except ValidationError:
#             raise ValidationError("Please enter a valid email address.")

    
#     def __str__(self):
#         return self.email
    
#     class Meta:
#         verbose_name = 'Email'
#         verbose_name_plural = 'Emails'