FROM alpine:latest
RUN mkdir /ngrook && \
    wget -O /ngrook/ngrok.zip https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip && \
    unzip -o /ngrook/ngrok.zip -d /ngrook && \
    rm /ngrook/ngrok.zip
COPY ngrok.yml /root/.ngrok2/ngrok.yml
WORKDIR /ngrook
EXPOSE 4040
CMD ["./ngrok", "start", "--all"]
