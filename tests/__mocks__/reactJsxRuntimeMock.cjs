const React = require('react');

function jsx(type, props, key) {
  if (type && typeof type === 'object' && !type.$$typeof) {
    type = 'MockedObjectComponent';
  }
  return React.createElement(type, key == null ? props : { ...props, key });
}

function jsxs(type, props, key) {
  return jsx(type, props, key);
}

module.exports = {
  jsx,
  jsxs,
  Fragment: React.Fragment,
};
