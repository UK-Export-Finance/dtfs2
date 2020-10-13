const fs = require('fs');
const moment = require('moment');
const api = require('./api');
const { getToken, removeMigrationUser } = require('./temporary-token-handler');
const consoleLogColor = require('./helpers/console-log-colour');

const filename = process.argv[2];

const loadUsersFromFile = () => {
  const jsonBuffer = fs.readFileSync(filename);
  return JSON.parse(jsonBuffer);
};

const generateRoles = (v1Role) => {
  if (v1Role === 'Maker/Checker') {
    return ['maker', 'checker'];
  }

  return [v1Role.toLowerCase()];
};


const apiSummary = (createdUsers) => ({
  successUsers: createdUsers.filter((createdUser) => createdUser.success).map(({ user }) => user.username),
  apiUserErrors: createdUsers.filter((createdUser) => !createdUser.success).map(({ username }) => username),
});

const teardown = async (logData) => {
  // remove migration user
  await removeMigrationUser();

  // log file
  const logFolder = './logs';
  const logFilename = `${logFolder}/user-migrate-log_${moment().unix()}.json`;

  if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder);
  }

  fs.writeFileSync(logFilename, logData);
  console.log(`Log file written to ${logFilename}`);
};

const migrateUsers = async () => {
  const existingUsers = await api.listUsers();
  const token = await getToken();
  const banks = await api.listBanks(token);

  const existingUsersList = existingUsers.map(({ username }) => username);
  const userNoBanksError = [];

  const usersV1 = loadUsersFromFile();
  const usersV2 = usersV1.map((userV1) => {
    const bank = banks.find((b) => b.id === userV1.Bank_id);
    if (!bank) {
      userNoBanksError.push(userV1.Mail);
      consoleLogColor(`unknown bank: ${userV1.Mail}`);
      return {};
    }

    const userV2 = {
      'user-status': 'active',
      timezone: 'Europe/London',
      username: userV1.Mail,
      firstname: userV1.First_name,
      surname: userV1.Last_name,
      email: userV1.Mail,
      roles: generateRoles(userV1.Roles),
      bank: {
        id: userV1.Bank_id,
        name: bank.name,
        emails: bank.emails,
      },
      disabled: userV1.Disabled === 'Disabled',
      v1_ID: userV1.User_id,
      password: `AbC!2345_${Math.random()}`,
    };

    const lastLogin = moment(userV1.Last_login, 'DD/MM/YYYY - hh:mm').utc().valueOf().toString();

    if (userV1.Last_login !== '01/01/1970 - 01:00') {
      userV2.lastLogin = lastLogin;
    }

    return userV2;
  });

  console.log('creating users');
  const existingUserErrors = [];
  const createUserPromises = [];

  usersV2.filter(({ username }) => username).forEach(async (user) => {
    if (existingUsersList.includes(user.username)) {
      consoleLogColor(`duplicate user: ${user.username}`);
      existingUserErrors.push(user.username);
      return;
    }
    const userCreate = api.createUser(user).then((createResult) => {
      if (createResult.success) {
        consoleLogColor(`created user: ${createResult.user.username}`, 'green');
      } else {
        consoleLogColor(`error creating user: ${createResult.username}`);
      }
      return createResult;
    });
    createUserPromises.push(userCreate);
  });

  const userCreate = await Promise.all(createUserPromises);

  const { successUsers, apiUserErrors } = apiSummary(userCreate);

  console.log('\n--------------');
  console.log('USER MIGRATION SUMMARY\n');

  consoleLogColor(`Created ${successUsers.length}/${usersV1.length} users `, successUsers.length === usersV1.length ? 'green' : 'red');

  if (existingUserErrors.length || apiUserErrors.length || userNoBanksError.length) {
    consoleLogColor(`error migrating ${existingUserErrors.length + apiUserErrors.length + userNoBanksError.length} users`);

    if (existingUserErrors.length) {
      consoleLogColor('\nexisting users');
      consoleLogColor(existingUserErrors.join('\n '));
    }

    if (apiUserErrors.length) {
      consoleLogColor('\napi errors');
      consoleLogColor(apiUserErrors.join('\n'));
    }

    if (userNoBanksError.length) {
      consoleLogColor('\nunknown bank2');
      consoleLogColor(userNoBanksError.join('\n'));
    }
  }

  const logData = JSON.stringify({
    time: moment().toString(),
    successUsers,
    existingUserErrors,
    apiUserErrors,
    userNoBanksError,
  });

  teardown(logData);
};

migrateUsers();
