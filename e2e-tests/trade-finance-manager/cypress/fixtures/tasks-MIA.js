const MOCK_MIA_TASKS = [
  {
    "groupTitle": "Set up deal",
    "id": 1,
    "groupTasks": [
      {
        "id": "1",
        "groupId": 1,
        "title": "Match or create the parties in this deal",
        "team": {
          "id": "BUSINESS_SUPPORT",
          "name": " Business support group"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": true
      },
      {
        "id": "2",
        "groupId": 1,
        "title": "Create or link this opportunity in Salesforce",
        "team": {
          "id": "BUSINESS_SUPPORT",
          "name": " Business support group"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      },
      {
        "id": "3",
        "groupId": 1,
        "title": "File all deal emails in this deal",
        "team": {
          "id": "UNDERWRITING_SUPPORT",
          "name": " Underwriting support"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      },
      {
        "id": "4",
        "groupId": 1,
        "title": "Create a credit analysis document",
        "team": {
          "id": "UNDERWRITING_SUPPORT",
          "name": "Underwriting support"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      },
      {
        "id": "5",
        "groupId": 1,
        "title": "Assign an underwriter for this deal",
        "team": {
          "id": "UNDERWRITER_MANAGERS",
          "name": "Underwriter managers"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      }
    ]
  },
  {
    "groupTitle": "Adverse history check",
    "id": 2,
    "groupTasks": [
      {
        "id": "1",
        "groupId": 2,
        "title": "Complete an adverse history check",
        "team": {
          "id": "UNDERWRITERS",
          "name": "Underwriters"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      }
    ]
  },
  {
    "groupTitle": "Underwriting",
    "id": 3,
    "groupTasks": [
      {
        "id": "1",
        "groupId": 3,
        "title": "Check exposure",
        "team": {
          "id": "UNDERWRITERS",
          "name": "Underwriters"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      },
      {
        "id": "2",
        "groupId": 3,
        "title": "Give the exporter a credit rating",
        "team": {
          "id": "UNDERWRITERS",
          "name": "Underwriters"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      },
      {
        "id": "3",
        "groupId": 3,
        "title": "Complete the credit analysis",
        "team": {
          "id": "UNDERWRITERS",
          "name": "Underwriters"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      }
    ]
  },
  {
    "groupTitle": "Approvals",
    "id": 4,
    "groupTasks": [
      {
        "id": "1",
        "groupId": 4,
        "title": "Check adverse history check",
        "team": {
          "id": "UNDERWRITER_MANAGERS",
          "name": "Underwriter managers"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      },
      {
        "id": "2",
        "groupId": 4,
        "title": "Check the credit analysis",
        "team": {
          "id": "UNDERWRITER_MANAGERS",
          "name": "Underwriter managers"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      },
      {
        "id": "3",
        "groupId": 4,
        "title": "Complete risk analysis (RAD)",
        "team": {
          "id": "RISK_MANAGERS",
          "name": "Risk managers"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      },
      {
        "id": "4",
        "groupId": 4,
        "title": "Approve or decline the deal",
        "team": {
          "id": "UNDERWRITER_MANAGERS",
          "name": "Underwriter managers"
        },
        "status": "To do",
        "assignedTo": {
          "userId": "Unassigned",
          "userFullName": "Unassigned"
        },
        "canEdit": false
      }
    ]
  }
]

module.exports = MOCK_MIA_TASKS;
