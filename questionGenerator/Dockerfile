# Use the official Python image as a base image
FROM python:3.11.4-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project to the container, including .env
COPY . /app/

# Expose the port Django will run on
EXPOSE 8001

# Run Django server (you might want to use gunicorn for production)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
