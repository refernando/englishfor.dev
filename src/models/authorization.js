function can(user, feature) {
  return user.features.includes(feature);
}

export default {
  can,
};
