#!/bin/bash

# Simple parameter builder for GitHub Actions
# This script generates parameter strings for az deployment group commands

set -e

# Network parameters (always included)
NETWORK_PARAMS="peeringRemoteVnetSubscriptionId=\${{ secrets.REMOTE_VNET_SUBSCRIPTION_VPN }} \\
peeringRemoteVnetResourceGroupName=\${{ secrets.REMOTE_VNET_RESOURCE_GROUP_VPN}} \\
peeringRemoteVnetName=\${{ secrets.REMOTE_VNET_NAME_VPN }} \\
peeringAddressSpace=\${{ secrets.VNET_ADDRESS_PREFIX }} \\
onPremiseNetworkIpsString=\"\$UKEF_VPN_IPS_ENV\" \\"

# Function to get APIM parameters
get_apim_params() {
    cat << 'EOF'
APIM_TFS_KEY=${{ secrets.APIM_TFS_KEY }} \
APIM_TFS_VALUE=${{ secrets.APIM_TFS_VALUE }} \
APIM_TFS_URL=${{ secrets.APIM_TFS_URL }} \
APIM_MDM_KEY=${{ secrets.APIM_MDM_KEY }} \
APIM_MDM_URL=${{ secrets.APIM_MDM_URL }} \
APIM_MDM_VALUE=${{ secrets.APIM_MDM_VALUE }} \
APIM_ESTORE_URL=${{ secrets.APIM_ESTORE_URL }} \
APIM_ESTORE_KEY=${{ secrets.APIM_ESTORE_KEY }} \
APIM_ESTORE_VALUE=${{ secrets.APIM_ESTORE_VALUE }} \
EOF
}

# Function to get auth parameters
get_auth_params() {
    cat << 'EOF'
JWT_SIGNING_KEY=${{ secrets.JWT_SIGNING_KEY }} \
JWT_VALIDATING_KEY=${{ secrets.JWT_VALIDATING_KEY }} \
SESSION_SECRET=${{ secrets.SESSION_SECRET }} \
DTFS_CENTRAL_API_KEY=${{ secrets.DTFS_CENTRAL_API_KEY }} \
EXTERNAL_API_KEY=${{ secrets.EXTERNAL_API_KEY }} \
PORTAL_API_KEY=${{ secrets.PORTAL_API_KEY }} \
TFM_API_KEY=${{ secrets.TFM_API_KEY }} \
UKEF_TFM_API_SYSTEM_KEY=${{ secrets.UKEF_TFM_API_SYSTEM_KEY }} \
UKEF_TFM_API_REPORTS_KEY=${{ secrets.UKEF_TFM_API_REPORTS_KEY }} \
EOF
}

# Function to get trade finance manager specific parameters
get_tfm_params() {
    cat << 'EOF'
COMPANIES_HOUSE_API_KEY=${{ secrets.COMPANIES_HOUSE_API_KEY }} \
ORDNANCE_SURVEY_API_KEY=${{ secrets.ORDNANCE_SURVEY_API_KEY }} \
GOV_NOTIFY_API_KEY=${{ secrets.GOV_NOTIFY_API_KEY }} \
GOV_NOTIFY_EMAIL_RECIPIENT=${{ secrets.GOV_NOTIFY_EMAIL_RECIPIENT }} \
UKEF_INTERNAL_NOTIFICATION=${{ secrets.UKEF_INTERNAL_NOTIFICATION }} \
ESTORE_URL=${{ secrets.ESTORE_URL }} \
CORS_ORIGIN=${{ secrets.CORS_ORIGIN }} \
EOF
}

# Function to get portal specific parameters
get_portal_params() {
    cat << 'EOF'
AZURE_PORTAL_EXPORT_FOLDER=${{ secrets.AZURE_PORTAL_EXPORT_FOLDER }} \
AZURE_PORTAL_FILESHARE_NAME=${{ secrets.AZURE_PORTAL_FILESHARE_NAME }} \
PDC_INPUTTERS_EMAIL_RECIPIENT=${{ secrets.PDC_INPUTTERS_EMAIL_RECIPIENT }} \
EOF
}

# Function to get utilization report parameters
get_utilization_params() {
    cat << 'EOF'
RATE_LIMIT_THRESHOLD=${{ vars.RATE_LIMIT_THRESHOLD}} \
UTILISATION_REPORT_MAX_FILE_SIZE_BYTES=${{ vars.UTILISATION_REPORT_MAX_FILE_SIZE_BYTES }} \
PORTAL_UI_URL=${{ vars.PORTAL_UI_URL }} \
UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH=${{ vars.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH }} \
UTILISATION_REPORT_OVERDUE_CHASER_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH=${{ vars.UTILISATION_REPORT_OVERDUE_CHASER_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH }} \
UTILISATION_REPORT_REPORTING_PERIOD_START_EMAIL_SCHEDULE='${{ vars.UTILISATION_REPORT_REPORTING_PERIOD_START_EMAIL_SCHEDULE }}' \
UTILISATION_REPORT_DUE_EMAIL_SCHEDULE='${{ vars.UTILISATION_REPORT_DUE_EMAIL_SCHEDULE }}' \
UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE='${{ vars.UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE }}' \
AZURE_UTILISATION_REPORTS_FILESHARE_NAME=${{ vars.AZURE_UTILISATION_REPORTS_FILESHARE_NAME }} \
UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE='${{ vars.UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE }}'
EOF
}

# Function to get Azure Functions specific parameters
get_functions_params() {
    cat << 'EOF'
AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE="$AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE_ENV"
EOF
}

# Main function to build parameters based on components
build_params() {
    local components=("$@")

    echo "environment=\${{ inputs.environment }} \\"
    echo "$NETWORK_PARAMS"

    for component in "${components[@]}"; do
        case "$component" in
            "trade-finance-manager-api"|"tfm")
                get_auth_params
                get_apim_params
                get_tfm_params
                ;;
            "portal-api"|"portal")
                get_auth_params
                get_apim_params
                get_portal_params
                ;;
            "utilization-reports"|"reports")
                get_utilization_params
                ;;
            "azure-functions"|"functions")
                get_functions_params
                ;;
            "auth")
                get_auth_params
                ;;
            "apim")
                get_apim_params
                ;;
            "all")
                get_auth_params
                get_apim_params
                get_tfm_params
                get_portal_params
                get_utilization_params
                get_functions_params
                ;;
        esac
    done
}

# Show usage if no arguments
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <component1> [component2] ..."
    echo ""
    echo "Available components:"
    echo "  trade-finance-manager-api (or tfm) - TFM API specific parameters"
    echo "  portal-api (or portal)              - Portal API specific parameters"
    echo "  utilization-reports (or reports)    - Utilization reports parameters"
    echo "  azure-functions (or functions)      - Azure Functions parameters"
    echo "  auth                                - Authentication parameters only"
    echo "  apim                                - APIM parameters only"
    echo "  all                                 - All parameters"
    echo ""
    echo "Examples:"
    echo "  $0 trade-finance-manager-api"
    echo "  $0 portal-api utilization-reports"
    echo "  $0 all"
    exit 1
fi

build_params "$@"