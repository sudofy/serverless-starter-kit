import { parseAPIGatewayEvent } from 'utils/parser';
import { success, failure } from 'utils/response';
import Boom from 'boom';
import connectToDatabase from '../utils/db.connection';
import * as responseMessages from '../utils/messages';
import UserCtrl from './user.controller';
import { checkUpdateUserSchema, checkChangePasswordSchema } from './user.validator';

const user = new UserCtrl();

connectToDatabase();

export async function updateUser(event, context, callback) { // eslint-disable-line 
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
    const { currentUser, body } = await parseAPIGatewayEvent(event);
    const validationError = checkUpdateUserSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const userInfo = await user.getBySub(currentUser.userId);
    const mongoUser = await user.getUserByCognitoId(currentUser.userId);
    if (!userInfo) {
      throw Boom.notFound(responseMessages.USER.USER_DOESNT_EXIST);
    }
    if (!mongoUser) {
      throw Boom.forbidden(responseMessages.USER.UPDATE_OUTSIDER_USERNAME);
    }
    const { username } = currentUser;
    const updatedData = await user.updateCognitoAttributes(username, body);
    response = success(updatedData);
  } catch (e) {
    response = await failure(e, event);
  }
  callback(null, response);
}

export async function changePassword(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
    const { body } = await parseAPIGatewayEvent(event);
    const validationError = await checkChangePasswordSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    await user.changeUserPassword(body);
    response = success({ message: responseMessages.USER.PASSWORD_CHANGED_SUCCESSFULLY });
  } catch (e) {
    response = await failure(e, event);
  }
  callback(null, response);
}

export async function getUserDetails(event, context, callback) { // eslint-disable-line 
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
    const { currentUser } = await parseAPIGatewayEvent(event);
    if (!currentUser) {
      throw Boom.badRequest(responseMessages.USER.ERR_INVALID_TOKEN);
    }
    const userInfo = await user.getBySub(currentUser.userId);
    if (!userInfo) {
      throw Boom.notFound(responseMessages.USER.USER_DOESNT_EXIST);
    }
    response = success(userInfo);
  } catch (e) {
    response = await failure(e, event);
  }
  callback(null, response);
}
