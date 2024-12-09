FROM golang:1.20-alpine as builder
RUN apk add --no-cache git
RUN go install github.com/mailhog/MailHog@latest

FROM alpine:latest
COPY --from=builder /go/bin/MailHog /usr/local/bin/mailhog
ENTRYPOINT ["mailhog"]