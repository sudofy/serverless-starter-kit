import { path, pathOr } from 'ramda';
import User from '../user/user.model';

const user = new User();
export function parseCognitoUser(rawUser) {
  return rawUser;
}

export async function parseAPIGatewayEvent(event) {
  let data = {};

  if (event.body !== '') {
    try {
      data = JSON.parse(event.body);
    } catch (e) {
      console.error('Error occur during parsing request body', e);
      data = {};
    }
  }
  let currentUser = parseCognitoUser(pathOr({}, ['requestContext', 'authorizer', 'claims'], event));
  if (currentUser && currentUser['cognito:username']) {
    const freshCognitoUser = await user.getByCognitoUsername(currentUser['cognito:username']);
    currentUser = {
      ...currentUser,
      ...freshCognitoUser
    };
  }

  return {
    body: data,
    path: path(['requestContext', 'resourcePath'], event),
    httpMethod: path(['requestContext', 'httpMethod'], event),
    stage: path(['requestContext', 'stage'], event),
    currentUser,
    params: event.pathParameters || event.path,
    queryParams: (event.queryStringParameters || event.query) || {},
    cognitoPoolClaims: event.cognitoPoolClaims,
    headers: event.headers
  };
}

export function parseCognitoEvent(event) {
  return {
    attributes: path(['request', 'userAttributes'], event),
    cognitoUserName: event.userName,
    userPoolId: event.userPoolId,
    validationData: path(['request', 'validationData'], event) || {}
  };
}
