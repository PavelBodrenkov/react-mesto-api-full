/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/authorized-err.js');

const { NODE_ENV, JWT_SECRET } = process.env;

function getcookie(req) {
  const { cookie } = req.headers;
  if (cookie) {
    const values = cookie.split(';').reduce((res, item) => {
      const data = item.trim().split('=');
      return { ...res, [data[0]]: data[1] };
    }, {});
    return values;
  }
  return undefined;
}

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Ошибка авторизации');
  }
  const cookies = getcookie(req);
  if (!cookies) {
    throw new UnauthorizedError('Авторизация не прошла');
  } else {
    const token = cookies.jwt;
    let payload;

    try {
      payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
    } catch (err) {
      throw new UnauthorizedError('Ошибка авторизации');
    }

    req.user = payload; // записываем пейлоуд в объект запроса

    next(); // пропускаем запрос дальше
  }
};
