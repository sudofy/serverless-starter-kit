import joi from "joi";
import * as R from "ramda";

joi.objectId = require("joi-objectid")(joi);

const getPlainError = joiError =>
  R.path(["error", "details", 0, "message"], joiError);

export const checkSignUpSchema = rawData => {
  // eslint-disable-line
  const schema = joi.object().keys({
    username: joi.string().required(),
    password: joi.string().required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    phone: joi.string().required(),
    pushNotification: joi.string().allow(null),
    notificationTime: joi.string().allow(null),
    role: joi.string(),
    email: joi
      .string()
      .regex(/^([\w]+[^"(),:;<>@[\]]+@([\w-]+\.)+[\w-]+)?$/)
      .required(),
    sId: joi.string().allow(null)
  });

  return getPlainError(joi.validate(rawData, schema));
};

export const checkChangePasswordSchema = rawData => {
  const schema = joi.object().keys({
    token: joi.string().required(),
    oldPassword: joi.string().required(),
    newPassword: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

export const checkUpdateUserSchema = rawData => {
  // eslint-disable-line
  const schema = joi.object().keys({
    firstName: joi.string(),
    lastName: joi.string(),
    phone: joi.string(),
    role: joi.string(),
    pushNotification: joi.string(),
    notificationTime: joi.string(),
    email: joi.string().regex(/^([\w]+[^"(),:;<>@[\]]+@([\w-]+\.)+[\w-]+)?$/)
  });

  return getPlainError(joi.validate(rawData, schema));
};

export const checkSignInSchema = rawData => {
  // eslint-disable-line

  const schema = joi.object().keys({
    username: joi.string().required(),
    password: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

export const checkForgotPasswordSchema = rawData => {
  // eslint-disable-line
  const schema = joi.object().keys({
    username: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

export const checkVerifyPinSchema = rawData => {
  // eslint-disable-line
  const schema = joi.object().keys({
    username: joi.string().required(),
    password: joi.string().required(),
    code: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};
