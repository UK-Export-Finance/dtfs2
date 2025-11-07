#!/bin/bash

# Parameter loader script for GitHub Actions deployments
# Usage: load-deployment-params.sh [service-name-1] [service-name-2] ...
# This script loads and merges parameter files for the specified services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARAMS_DIR="${SCRIPT_DIR}/deployment-params"
COMMON_DIR="${PARAMS_DIR}/common"
SERVICES_DIR="${PARAMS_DIR}/services"

# Function to load common parameter file
load_common_params() {
    local param_file="$1"
    local file_path="${COMMON_DIR}/${param_file}"

    if [[ ! -f "$file_path" ]]; then
        echo "Warning: Common parameter file $param_file not found"
        return 1
    fi

    # Extract parameter mappings from JSON
    jq -r '.secretMappings // {}, .variableMappings // {}, .specialMappings // {} | to_entries[] | "\(.key)=\(.value)"' "$file_path"
}

# Function to load service-specific parameters
load_service_params() {
    local service_name="$1"
    local file_path="${SERVICES_DIR}/${service_name}.json"

    if [[ ! -f "$file_path" ]]; then
        echo "Warning: Service parameter file ${service_name}.json not found"
        return 1
    fi

    # Load common parameter files referenced by this service
    local common_files
    common_files=$(jq -r '.commonParameterFiles[]? // empty' "$file_path")

    for common_file in $common_files; do
        echo "# Loading common parameters from $common_file"
        load_common_params "$common_file"
        echo ""
    done

    # Load service-specific parameters
    echo "# Loading service-specific parameters for $service_name"
    jq -r '.secretMappings // {}, .variableMappings // {}, .specialMappings // {} | to_entries[] | "\(.key)=\(.value)"' "$file_path"
    echo ""
}

# Function to generate deployment parameters string
generate_deployment_params() {
    local services=("$@")
    local params=()
    local seen_params=()

    # Always load network parameters first
    echo "# Loading network parameters"
    while IFS='=' read -r key value; do
        [[ -n "$key" && -n "$value" ]] || continue
        if [[ ! " ${seen_params[*]} " =~ " ${key} " ]]; then
            params+=("${key}=${value}")
            seen_params+=("$key")
        fi
    done < <(load_common_params "network-params.json" 2>/dev/null || true)
    echo ""

    # Load parameters for each specified service
    for service in "${services[@]}"; do
        while IFS='=' read -r key value; do
            [[ -n "$key" && -n "$value" ]] || continue
            if [[ ! " ${seen_params[*]} " =~ " ${key} " ]]; then
                params+=("${key}=${value}")
                seen_params+=("$key")
            fi
        done < <(load_service_params "$service" 2>/dev/null || true)
    done

    # Output parameters in a format suitable for az deployment group command
    printf '%s \\\n' "${params[@]}"
}

# Function to list available services
list_services() {
    echo "Available services:"
    if [[ -d "$SERVICES_DIR" ]]; then
        for file in "$SERVICES_DIR"/*.json; do
            if [[ -f "$file" ]]; then
                basename "$file" .json
            fi
        done
    else
        echo "No services directory found at $SERVICES_DIR"
    fi
}

# Function to show parameter file content
show_service_info() {
    local service_name="$1"
    local file_path="${SERVICES_DIR}/${service_name}.json"

    if [[ ! -f "$file_path" ]]; then
        echo "Service parameter file ${service_name}.json not found"
        return 1
    fi

    echo "Service: $service_name"
    echo "Description: $(jq -r '.description // "No description"' "$file_path")"
    echo "Parameters:"
    jq -r '.parameters[]? // empty' "$file_path" | sed 's/^/  - /'

    local common_files
    common_files=$(jq -r '.commonParameterFiles[]? // empty' "$file_path")
    if [[ -n "$common_files" ]]; then
        echo "Common parameter files:"
        echo "$common_files" | sed 's/^/  - /'
    fi
}

# Main script logic
main() {
    case "${1:-}" in
        "--list"|"-l")
            list_services
            ;;
        "--info"|"-i")
            if [[ -n "${2:-}" ]]; then
                show_service_info "$2"
            else
                echo "Usage: $0 --info <service-name>"
                exit 1
            fi
            ;;
        "--help"|"-h"|"")
            echo "Usage: $0 [OPTIONS] [service-name-1] [service-name-2] ..."
            echo ""
            echo "OPTIONS:"
            echo "  --list, -l          List available services"
            echo "  --info, -i <name>   Show information about a specific service"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 trade-finance-manager-api portal-api"
            echo "  $0 --list"
            echo "  $0 --info trade-finance-manager-api"
            ;;
        *)
            generate_deployment_params "$@"
            ;;
    esac
}

main "$@"