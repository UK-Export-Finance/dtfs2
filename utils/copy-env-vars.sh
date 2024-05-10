folders=("dtfs-central-api" "external-api" "gef-ui" "portal" "portal-api" "secrets" "trade-finance-manager-api" "trade-finance-manager-ui" "utils/mock-data-loader")

for folder in "${folders[@]}"; do
    echo "Copying .env file to $folder folder..."
    cp .env "$folder/"
done

echo "Done!"

