import joi from "joi";
import * as R from "ramda";
import getPlainError from '../utils/validation';

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
    phone: joi.string(),
    role: joi.string(),
    email: joi.string().regex(/^([\w]+[^"(),:;<>@[\]]+@([\w-]+\.)+[\w-]+)?$/)
  });

  return getPlainError(joi.validate(rawData, schema));
};

