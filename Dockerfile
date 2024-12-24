# Dockerfile

# Use the official Python image as the base image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
# RUN apt-get update && apt-get install -y netcat-tradditional

# Create and set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . /app/
RUN cp -r /usr/local/lib/python3.10/site-packages/drf_yasg/static/drf-yasg /app/static/
RUN cp -r /usr/local/lib/python3.10/site-packages/django/contrib/admin/static/admin /app/static

# Set the entrypoint
# ENTRYPOINT ["/app/entrypoint.sh"]
