FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    WORKSHOP_DATA_DIR=/data \
    WORKSHOP_REQUIRE_AUTH=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY workshop/ workshop/
COPY output/ output/
EXPOSE 8080
CMD ["python", "workshop/server.py"]
