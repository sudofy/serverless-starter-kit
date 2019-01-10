import Boom from 'boom';
import UserModel from './user.model';
import * as responseMessages from '../utils/messages';

export default class UserController {
  constructor() {
    this.userDb = new UserModel();
  }

  async getUserByCognitoId(cognitoId) {
    let mongoDbUser;
    try {
      mongoDbUser = await this.userDb.getUserByCognitoId(cognitoId);
    } catch (error) {
      throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_USER_BY_COGNITO_ID, error);
    }

    return mongoDbUser;
  }

  async getBySub(subId) {
    try {
      const ctrlInfo = await this.userDb
        .fetchByAttribute('sub', subId)
        .then(Users => (Users || [])[0]);
      return ctrlInfo;
    } catch (err) {
      throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_USER_BY_SUB_ID, err);
    }
  }

  async updateCognitoAttributes(cognitoUserName, body) {
    const attributes = { ...body };
    if (body.email) {
      attributes.email = body.email;
      attributes.email_verified = 'true';
    }
    try {
      await this.userDb.updateAttributes(cognitoUserName, attributes);
    } catch (error) {
      throw Boom.forbidden(responseMessages.USER.ERR_UPDATING_USER_ATTRIBUTE, error);
    }
    return this.getByPreferredUsername(cognitoUserName);
  }

  async changeUserPassword(body) {
    const { token, oldPassword, newPassword } = body;
    const params = {
      AccessToken: token, /* required */
      PreviousPassword: oldPassword, /* required */
      ProposedPassword: newPassword /* required */
    };
    try {
      await this.userDb.changePassword(params);
    } catch (error) {
      throw Boom.forbidden(responseMessages.USER.ERR_UPDATING_PASSWORD, error);
    }
  }

  async getByPreferredUsername(Username) {
    try {
      const ctrlInfo = await this.userDb
        .fetchByAttribute('preferred_username', Username)
        .then(Users => (Users || [])[0]);
      return ctrlInfo;
    } catch (err) {
      throw Boom.forbidden(responseMessages.USER.ERR_FETCHING_USER_BY_ATTRIBUTE, err);
    }
  }

  async create(user) {
    try {
      const params = {
        cognitoId: user.userId,
        workspaces: user.workspaces
      };
      const newUser = await this.userDb.createUser(params);
      return newUser;
    } catch (err) {
      throw (err);
    }
  }
}
