import joi from "joi";
import * as R from "ramda";
import getPlainError from '../utils/validation';

export const checkSignUpSchema = rawData => {
  // eslint-disable-line
  const schema = joi.object().keys({
    username: joi.string().required(),
    password: joi.string().required(),
    phone: joi.string().required(),
    role: joi.string(),
    email: joi
      .string()
      .regex(/^([\w]+[^"(),:;<>@[\]]+@([\w-]+\.)+[\w-]+)?$/)
      .required(),
    sId: joi.string().allow(null)
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
