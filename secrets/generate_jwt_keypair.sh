#!/usr/bin/env bash
set -exuo pipefail

openssl genrsa -out ./private.pem 4096
openssl rsa -in ./private.pem -outform PEM -pubout -out public.pem

base64 -w 0 private.pem > private.b64
base64 -w 0 public.pem > public.b64
