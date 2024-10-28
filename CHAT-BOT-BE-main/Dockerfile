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

# Copy the entire Flask project to the container
COPY . /app/

# Expose the port Flask will run on
EXPOSE 8002

# Run Flask using Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8002", "app:app"]
