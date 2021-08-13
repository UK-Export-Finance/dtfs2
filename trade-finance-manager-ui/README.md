# Trade Finance Manager UI

Also known as TFM; This UI is an internal application used to review deals after they have been submitted to UKEF.

The UI uses GraphQL to query [TFM API](trade-finance-manager-api) for deals and facilities, then renders the data with GovUK and MOJ design components. There are some custom components.

The only logic in the codebase is for page routes, controllers, form validation and user permissions. The UI should be kept as simple as possible - only adding logic or business rules when it absolutely needs to be in the UI.


