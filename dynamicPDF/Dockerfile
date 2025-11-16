# Use a Python base image that also includes an OS package manager (like Debian/Ubuntu)
FROM python:3.11-slim

# 1. Install Tesseract OCR and its required libraries
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-fra \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy Python dependencies file and install them
# You should have a requirements.txt with 'pytesseract' and any other packages.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy your Python script and all other necessary files
# Replace 'your_script.py' and 'your_project/' with your actual file/folder names
COPY main.py .

# 5. Command to run your Python script when the container starts
CMD ["python", "main.py"]