# portal 🏛️

**portal** is the user interface (UI) for BSS/EWCS (Bond Support Scheme, Export Working Capital Scheme). It relies on the portal-api for sending and receiving data and also handles user authentication.

## Prerequisite 🧩

Ensure you have an `.env` file set up. You can use `.env.sample` as a starting point. Some sensitive variables must be shared within the team.

## Running Locally 🏃‍♂️

1. Run `npm run start`.
2. Visit http://localhost:5000 in your web browser.

Alternatively, you can start all services from the root directory using `npm run start`.

## Login Credentials 🔐

You can find mock login credentials in the `utils/mock-data-loader/portal/users.js` file.

## Testing 🧪

### **Run a UI test suite**

Verbose with coverage:

```shell
npm run unit-test
```

### **Run a single UI test**

```shell
npm run unit-test ./path/to/file.test.js
```

### **Run UI component tests**

```shell
npm run component-test
```

### **Run a single UI component test**

```shell
npm run component-test ./component-tests/path/to/file.component-test.js
```

### **End-to-End Tests**

Please refer to the README.md in the `e2e-tests` directory for details on running end-to-end tests.

## Basic Happy Flow Behind the Scenes 🌟

1. The user logs into the Portal UI.
2. The user selects which product to apply for: BSS or GEF.
3. Depending on the chosen product, the BSS or GEF UI will be served.
4. The user completes the deal/application and submits it to the bank.
5. The bank approves the deal and submits it to UKEF. The deal is then sent to Trade Finance Manager (TFM).

## User login process 🔓

Portal has a login process that requires a user to check their emails to successfully log in:

- **user** navigates to `/login`
  - **Session storage** initiates a session and issues the **user** a cookie
- **user** logs in with username and password

  - **Portal UI** checks username and password with validation rules
  - **Portal UI** checks login information with **Portal API**
    - **Portal API** checks username and password exist
    - **Portal API** issues a token to **Portal UI** with `loginStatus: 'Valid username and password'`¹
  - **Portal UI** saves this token to the session in **Session storage**
  - **Portal UI** requests **Portal API** sends the user an email

    - **Portal API** generates an login link, saving this to the database (including time issued)
    - **Portal API** requests an login to be sent with this link

  - **Portal UI** redirects the user to the `check-your-email` page ² ³

- **user** clicks on login link
  - **Portal UI** checks login link with **Portal API**
    - **Portal API** checks this login link against the database login link for validity (including it has been clicked half an hour of being issued)
    - **Portal API** issues a new token to **Portal UI** with `loginStatus: 'Valid 2FA'`, and includes some additional user information ⁴
  - **Portal UI** saves this data to the session in **Session storage** (replacing the old token)
  - **Portal UI** redirects user to the `/deals` page
- **user** is logged in

¹ This partially logged in token is valid for a short period of time

² These pages are restrited, and require a user to have a token with `loginStatus: 'Valid username and password'`.

³ We do not monitor whether the email is successfully sent, and redirect regardless. If an email has failed to send, a user can request a resent email up to two additional times.

⁴ A token with `loginStatus: 'Valid 2FA'` allows a user to access material where they are required to be fully logged in

## Moving Forward - Aligning Portal, BSS, and GEF 🔀

### Design 🎨

Portal (also known as BSS/EWCS) was the first product and UI.

Portal/BSS currently has an old design - the initial approach was to shift the old design/technology into a JavaScript application.

The vision is that once GEF is completed (with a new design), GEF can be reused in BSS; Bringing both products into a consistent, modern design.

### Data 📊

The current BSS data structure is not great - this is due to the old design and lack of initial understanding.

The vision is to use the same GEF data structure in BSS.

### Summary 📝

BSS and GEF products are very similar, but they currently have different designs and approaches.

Portal/BSS should be shifted to use the GEF UI, API, and data structure in order to:

- Deliver a nice, modern user experience.
- Be consistent.
- Reduce data mapping needs in other systems.

This could also help the directory structure which can be confusing.

Currently for BSS:

1. User login (/portal).
2. Select product BSS (/portal).
3. Product pages served (/portal).

Currently for GEF:

1. User login (/portal).
2. Select product GEF (/portal).
3. Product pages served (/gef-ui).

BSS could be separated from Portal, and the Portal UI's only purpose is to login and select a product. i.e.,

1. User login (/portal).
2. Select product BSS or GEF (/portal).
3. Product pages served (/bss-ui or /gef-ui).

---

