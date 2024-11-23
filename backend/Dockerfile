FROM python:3.10.6-slim

EXPOSE 8080

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

CMD [ "python" , "run.py" ]

