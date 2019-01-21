import boom from 'boom';
import serializeError from 'serialize-error';
import Raven from 'raven';

Raven.config(process.env.RAVEN_CONFIG, {
  release: '1.3.0'
}).install();

function buildResponse(statusCode, data, message, isSuccess, noCache) {
  const body = JSON.stringify({
    data,
    message,
    success: isSuccess
  });
  const response = {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body
  };
  if (noCache) {
    response.headers['Cache-Control'] = 'private, no-cache, no-store, must-revalidate';
    response.headers['Expires'] = '-1'; // eslint-disable-line
    response.headers['Pragma'] = 'no-cache'; // eslint-disable-line
  }
  return response;
}

export function success(body, isCreated, message, noCache) {
  return buildResponse(isCreated ? 201 : 200, body, message, true, noCache);
}

function reportToRaven(err, event) {
  if (event && event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.claims) {
    Raven.setContext({
      user: event.requestContext.authorizer.claims
    });
  }
  return new Promise((resolve) => {
    resolve();
    Raven.captureException(err, { extra: { err, event } }, (sendErr, eventId) => {
      if (sendErr) {
        console.log('Raven Report Error');
        console.log(sendErr);
      } else {
        console.log(`Raven Report id ${eventId}`);
      }
      resolve();
    });
  });
}

export async function failure(err, event) {
  await reportToRaven(err, event);
  if (boom.isBoom(err)) {
    return buildResponse(err.output.statusCode, err, err.data ? err.data.message : err.output.payload.message, false);
  }
  const serializedErr = serializeError(err);
  let errMessage;
  if (serializedErr && serializedErr.message) {
    errMessage = serializedErr.message;
  }

  return buildResponse(500, JSON.stringify(serializedErr), errMessage ? errMessage : serializedErr); // eslint-disable-line 
}
