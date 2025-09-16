###################
# 1. BUILD
###################
FROM mcr.microsoft.com/mssql/server:2022-CU13-ubuntu-22.04

# Root
COPY --chown=node:node init.sh /

# Execute scirpt
CMD ["/init.sh"]
