# API Keys - save file in ./secrets folder

export JWT_SIGNING_KEY=$(cat private.b64)
export JWT_VALIDATING_KEY=$(cat public.b64)
