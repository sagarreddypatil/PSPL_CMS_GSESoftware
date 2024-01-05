
FROM python:3.11

RUN pip install Flask flask-cors msgpack gunicorn

COPY . /app

WORKDIR /app

EXPOSE 8080
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]