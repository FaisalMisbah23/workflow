const React = require('react');

function jsx(type, props, key) {
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
