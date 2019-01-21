import { parseAPIGatewayEvent } from 'utils/parser';
import { success, failure } from 'utils/response';
import { checkSignUpSchema, checkSignInSchema, checkForgotPasswordSchema, checkVerifyPinSchema } from './auth.validator';
import Boom from 'boom';
import connectToDatabase from '../utils/db.connection';
import AuthController from './auth.controller';

const auth = new AuthController();

connectToDatabase();

export async function login(event, context, callback) { // eslint-disable-line 
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
    const { body } = await parseAPIGatewayEvent(event);
    const validationError = checkSignInSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await auth.signInUser(body);
    response = success(data);
  } catch (e) {
    response = await failure(e, event);
  }
  callback(null, response);
}


export async function createUser(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
    const { body } = await parseAPIGatewayEvent(event);
    const validationError = checkSignUpSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    console.log('before auth.signUpUser');
    const data = await auth.signUpUser(body);
    response = success(data);
  } catch (e) {
    response = await failure(e, event);
  }
  callback(null, response);
}


export async function forgotPassword(event, context, callback) { // eslint-disable-line 
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
    const { body } = await parseAPIGatewayEvent(event);
    const validationError = checkForgotPasswordSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await auth.resetPassword(body);
    response = success(data);
  } catch (e) {
    response = await failure(e, event);
  }
  callback(null, response);
}

export async function verifyPin(event, context, callback) { // eslint-disable-line 
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
    const { body } = await parseAPIGatewayEvent(event);
    const validationError = checkVerifyPinSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await auth.verifyPin(body);
    response = success(data);
  } catch (e) {
    response = await failure(e, event);
  }
  callback(null, response);
}
