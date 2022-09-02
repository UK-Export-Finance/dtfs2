#!/bin/bash
# API Keys - save file in ./secrets folder

# Directory locations
current_dir=$PWD
# https://stackoverflow.com/questions/59895/how-to-get-the-source-directory-of-a-bash-script-from-within-the-script-itself
secrets_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $secrets_dir

# Generate the key if needed
if [ ! -f "jwt_key/private.pem" ]; then
    mkdir -p jwt_key
    openssl genrsa -out jwt_key/private.pem 4096
    openssl rsa -in jwt_key/private.pem -outform PEM -pubout -out jwt_key/public.pem
fi

# The keys are stored as Base 64 to avoid any issues with line-wrapping
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  export JWT_SIGNING_KEY=$(base64 -w 0 jwt_key/private.pem)
  export JWT_VALIDATING_KEY=$(base64 -w 0 jwt_key/public.pem)
elif [[ "$OSTYPE" == "darwin"* ]]; then
  export JWT_SIGNING_KEY=$(base64 -b 0 jwt_key/private.pem)
  export JWT_VALIDATING_KEY=$(base64 -b 0 jwt_key/public.pem)
fi

cd $current_dir
