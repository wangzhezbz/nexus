FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5100
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5100", "wsgi:app"]
