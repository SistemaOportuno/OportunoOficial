const helpers = {};

helpers.ifEquals = (a, b, opts) => {
    if (a == b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
};

module.exports = helpers;