FROM python:3.12-slim

WORKDIR /app

COPY mock_seguros.py schemas.json ./
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
