import * as R from 'ramda';
import UserSchema from './user.schema';

const AWS = require('aws-sdk');

export default class UserModelClass {
  constructor() {
    this.cognito = new AWS.CognitoIdentityServiceProvider({
      region: process.env.REGION,
    });
  }

  static attribNameMapper(origin, inversed) {
    // eslint-disable-line
    const mapping = {
      'sub': 'userId', // eslint-disable-line
      'preferred_username': 'username', // eslint-disable-line
    };

    if (inversed) {
      const nMapping = R.invertObj(mapping);
      return nMapping[origin] || origin;
    }

    return mapping[origin] || origin;
  }

  fetchRandom() {
    return new Promise((resolve, reject) => {
      UserSchema.findOne().exec((err, user) => {
        if (err) {
          reject(err);
        }
        resolve(user);
      });
    });
  }

  updateAttributes(cognitoUserName, attributes, userPoolId) {
    const params = {
      UserPoolId: userPoolId || process.env.COGNITO_POOL_ID,
      Username: cognitoUserName,
      UserAttributes: R.compose(
        R.map((attribName) => {
          if (attribName === 'phone') {
            return {
              Name: 'phone_number',
              Value: attributes.phone
            };
          } else if (attribName === 'email') {
            return {
              Name: 'email',
              Value: attributes[attribName],
            };
          }
          return {
            Name: UserModelClass.attribNameMapper(attribName, true),
            Value: attributes[attribName],
          };
        }),
        R.keys
      )(attributes),
    };
    return this.cognito.adminUpdateUserAttributes(params).promise();
  }

  static extractAttribFromCognitoUser(cognitoUser, attributesKey = 'UserAttributes') {
    if (!cognitoUser[attributesKey] || !Array.isArray(cognitoUser[attributesKey])) {
      return cognitoUser;
    }

    const plainObjAttribs = cognitoUser[attributesKey].reduce((container, attr) => {
      const key = UserModelClass.attribNameMapper(attr.Name);
      container[key] = attr.Value;  // eslint-disable-line
      return container;
    }, {});

    return {
      ...plainObjAttribs,
      _meta: R.omit(attributesKey, cognitoUser)
    };
  }

  changePassword(params) {
    return this.cognito.changePassword(params).promise();
  }

  getByCognitoUsername(cognitoUserName, userPoolId) {
    const params = {
      UserPoolId: userPoolId || process.env.COGNITO_POOL_ID,
      Username: cognitoUserName
    };

    return this.cognito
      .adminGetUser(params)
      .promise()
      .then(UserModelClass.extractAttribFromCognitoUser);
  }


  // Creates user in mongoDB
  createUser(userData) {
    const user = new UserSchema(userData);
    return new Promise((resolve, reject) => {
      user.save((err, newUser) => {
        if (err) {
          reject(err);
        }
        UserSchema.populate(newUser, { path: 'workspaces.workspace' }).then((populatedUser) => {
          resolve(populatedUser);
        });
      });
    });
  }

  async fetchByAttribute(attribName, attribValue, userPoolId) {
    // Note that you can't search for custom attributes
    const params = {
      UserPoolId: userPoolId || process.env.COGNITO_POOL_ID,
      Filter: `${attribName} = "${attribValue}"`
    };
    const info = await this.cognito
      .listUsers(params)
      .promise()
      .then(data => data.Users.map(user => UserModelClass.extractAttribFromCognitoUser(user, 'Attributes')));
    return info;
  }


  getUserByCognitoId(cognitoId) {
    return new Promise(async (resolve, reject) => {
      const query = { cognitoId };

      UserSchema.findOne(query).lean().exec((err, userData) => {
        if (err) {
          reject(err);
        }
        resolve(userData);
      });
    });
  }
}

