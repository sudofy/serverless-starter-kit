
const AWS = require('aws-sdk');

export default class SingUpModelClass {
  constructor() {
    this.cognito = new AWS.CognitoIdentityServiceProvider({
      region: process.env.REGION,
    });
  }
  createCognitoUser(params) {
    return this.cognito.adminCreateUser(params).promise();
  }
  authUser(params) {
    return this.cognito.initiateAuth(params).promise();
  }
  authChallenge(params) {
    return this.cognito.respondToAuthChallenge(params).promise();
  }
  sendConfirmationCode(params) {
    return this.cognito.forgotPassword(params).promise();
  }
  confirmIncomingCode(params) {
    return this.cognito.confirmForgotPassword(params).promise();
  }
}
