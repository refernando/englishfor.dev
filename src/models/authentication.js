import { jwtVerify, SignJWT } from "jose";

const encodedJwtTokenSecretKey = new TextEncoder().encode(process.env.JWT_TOKEN_SECRET_KEY)

async function create(userId, response) {
  const token = await new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('48h')
    .sign(encodedJwtTokenSecretKey)

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 48 // 48 hours in seconds
  });

  return response;
}

async function validate(request) {
  const token = request.cookies.get('token');
  if (!token) return false;
  try {
    const decodedJWT = await jwtVerify(
      token.value,
      encodedJwtTokenSecretKey
    )

    if (!decodedJWT) return false;

    return true;
  } catch (e){
    return false;
  }
}

async function validateByToken(token) {
  if (!token) return false;
  try {
    const decodedJWT = await jwtVerify(
      token.value,
      encodedJwtTokenSecretKey
    )

    if (!decodedJWT) return false;

    return true;
  } catch (e){
    return false;
  }
}

async function getUserId(request) {
  const token = request.cookies.get('token');
  if (!token) return null;
  try {
    const decodedJWT = await jwtVerify(
      token.value,
      encodedJwtTokenSecretKey
    )

    if (!decodedJWT) return null;

    return decodedJWT.payload.id;
  } catch (e){
    return null;
  }
}

async function destroy(response) {
  response.cookies.set('token', '', { httpOnly: true, maxAge: 0 })
  return response;
}

export default {
  create,
  validate,
  validateByToken,
  getUserId,
  destroy
};
