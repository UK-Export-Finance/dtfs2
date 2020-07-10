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

# The public and private keys are stored as Base 64 in the environment variables to avoid any issues with line-wrapping:
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    private_key_b64=$(base64 -w0 jwt_key/private.pem)
    public_key_b64=$(base64 -w0 jwt_key/public.pem)
elif [[ "$OSTYPE" == "darwin"* ]]; then
    private_key_b64=$(base64 -b0 jwt_key/private.pem)
    public_key_b64=$(base64 -b0 jwt_key/public.pem)
fi
export JWT_SIGNING_KEY=$private_key_b64
export JWT_VALIDATING_KEY=$public_key_b64

cd $current_dir
