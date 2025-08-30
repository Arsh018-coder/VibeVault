const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const passport = require("passport");
const User = require("../models/User");
const { JWT_SECRET } = require("./environment");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};


passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).select("-password");
      if (user) {
        return done(null, user); // user found
      }
      return done(null, false); // no user
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;
