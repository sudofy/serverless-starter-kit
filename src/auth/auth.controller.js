import Boom from 'boom';
import User from '../user/user.model';
import AuthModelClass from './auth.model';
import * as responseMessages from './auth.messages';
import UserController from '../user/user.controller';

export default class AuthController {
  constructor() {
    this.UserDb = new User();
    this.userCtrl = new UserController();
    this.authDb = new AuthModelClass();
  }

  async signInUser(body) {
    let authData;
    try {
      const { username, password } = body;
      try {
        authData = await this.initiateAuth(username, password);
      } catch (error) {
        throw Boom.forbidden(responseMessages.INITIATE_AUTH_ERR, error);
      }
      const { AuthenticationResult } = authData;
      const { AccessToken, RefreshToken, IdToken } = AuthenticationResult;
      let cognitoUser;
      try {
        cognitoUser = await this.userCtrl.getByPreferredUsername(username);
        delete cognitoUser._meta;
      } catch (error) {
        throw Boom.notFound(responseMessages.GET_BY_USERNAME_ERR, error);
      }
      let mongoDBUser;
      try {
        mongoDBUser = await this.userCtrl.getUserByCognitoId(cognitoUser.userId);
      } catch (error) {
        throw Boom.notFound(responseMessages.GET_BY_COGNITO_ID_ERR, error);
      }

      const currentUser = {
        cognito: cognitoUser,
        mongoDB: mongoDBUser,
        TokenContainer: {
          AccessToken, RefreshToken, IdToken
        }
      };
      return currentUser;
    } catch (err) {
      throw err;
    }
  }


  async signUpUser(body) {
    try {
      // Check if mongodb is alive
      // await this.UserDb.fetchRandom();
      const {
        username, email, password, phone, firstName, lastName
      } = body;
      const preferredUsername = username;
      const verifiedEmail = {
        Name: 'email_verified',
        Value: 'true'
      };
      const UserAttributes = [
        {
          Name: 'phone_number',
          Value: phone
        },
        {
          Name: 'preferred_username',
          Value: preferredUsername
        },
        {
          Name: 'email',
          Value: email
        }
      ];

      if (body.email) {
        UserAttributes.push(verifiedEmail);
      }
      const params = {
        UserPoolId: process.env.COGNITO_POOL_ID, /* required */
        Username: `${body.username}`, /* required */
        TemporaryPassword: password,
        UserAttributes,
        ValidationData: [
          {
            Name: 'pureUserName',
            Value: preferredUsername
          },
        ],
        MessageAction: 'SUPPRESS', // new account is created please verofy.
      };

      let signupData;
      try {
        signupData = await this.authDb.createCognitoUser(params);
      } catch (error) {
        if (error.message.includes('username')) {
          throw Boom.notAcceptable(responseMessages.ALREADY_EXIST_USERNAME, error);
        } else if (error.message.includes('email')) {
          throw Boom.notAcceptable(responseMessages.ALREADY_EXIST_EMAIL, error);
        } else {
          throw Boom.notAcceptable(responseMessages.PRE_SIGNUP_ERR, error);
        }
      }
      const UserId = signupData.User.Attributes[0].Value;
      let authData;
      try {
        authData = await this.initiateAuth(username, password);
      } catch (error) {
        throw Boom.forbidden(responseMessages.INITIATE_AUTH_ERR, error);
      }
      let tokenContainer;
      try {
        tokenContainer = await this.respondToAuthChallenge(authData.ChallengeName, authData.Session, password, params.Username);
      } catch (error) {
        throw Boom.forbidden(responseMessages.RESPOND_AUTH_CHALLENGE_ERR, error);
      }
      const { AuthenticationResult } = tokenContainer;
      const { AccessToken, RefreshToken, IdToken } = AuthenticationResult;
      let userData;
      try {
        userData = await this.userCtrl.getBySub(UserId);
        delete userData._meta;
      } catch (error) {
        throw Boom.notFound(responseMessages.GET_BY_SUB_ERR, error);
      }
      const mongoDBUser = await this.userCtrl.create(userData);
      const userDetails = {
        cognito: userData,
        mongoDB: mongoDBUser,
        TokenContainer: {
          AccessToken, RefreshToken, IdToken
        }
      };
      return userDetails;
    } catch (err) {
      throw err;
    }
  }

  async resetPassword({ username }) {
    let wantedUser;
    try {
      wantedUser = await this.userCtrl.getByPreferredUsername(username);
    } catch (error) {
      throw Boom.forbidden(responseMessages.ERR_FETCHING_USER_BY_PREFERRED, error);
    }

    if (!wantedUser) {
      throw Boom.notFound(responseMessages.USER_DOESNT_EXIST);
    }

    const params = {
      Username: username /* required */,
      ClientId: process.env.COGNITO_CLIENT_ID
    };
    return this.authDb.sendConfirmationCode(params);
  }

  async initiateAuth(username, password) {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH', /* required */
      ClientId: process.env.COGNITO_CLIENT_ID, /* required */
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };
    return this.authDb.authUser(params);
  }

  async respondToAuthChallenge(challengeName, session, newPass, username) {
    const params = {
      ChallengeName: challengeName, /* required */
      ClientId: process.env.COGNITO_CLIENT_ID, /* required */
      ChallengeResponses: {
        NEW_PASSWORD: newPass,
        USERNAME: username
      },
      Session: session
    };
    return this.authDb.authChallenge(params);
  }

  async verifyPin(body) {
    const { username, password, code } = body;
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID, /* required */
      ConfirmationCode: code, /* required */
      Password: password, /* required */
      Username: username, /* required */
    };
    return this.authDb.confirmIncomingCode(params);
  }
}
