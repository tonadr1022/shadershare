FROM golang:alpine AS built
RUN apk update && \
    apk add curl \
    git \
    bash \
    make \
    ca-certificates && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# get deps
COPY go.mod go.sum ./
RUN go mod download

# copy source
COPY . .

# build
ENV CGO_ENABLED=0
RUN go build -o /tmp/server ./cmd/server/main.go

# deploy binary into lean image
FROM alpine:latest
RUN apk --no-cache add ca-certificates bash 
WORKDIR /app

COPY --from=built /tmp/server /usr/bin/server

EXPOSE 8080

ENTRYPOINT ['/app/entrypoint.sh']
