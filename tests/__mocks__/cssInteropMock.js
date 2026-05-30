const React = require('react');

function jsx(type, props, key) {
  return React.createElement(type, key == null ? props : { ...props, key });
}

function jsxs(type, props, key) {
  return jsx(type, props, key);
}

module.exports = {
  __esModule: true,
  default: {},
  jsx,
  jsxs,
  Fragment: React.Fragment,
  vars: () => ({}),
  rem: (value) => value,
  useColorScheme: () => ({ colorScheme: 'light', setColorScheme: jest.fn(), toggleColorScheme: jest.fn() }),
  colorScheme: {
    get: () => 'light',
    set: jest.fn(),
    toggle: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
  createInteropElement: (type, props, ...children) => React.createElement(type, props, ...children),
  wrapJSX: (jsx) => jsx,
  wrapJsx: (jsx) => jsx,
  cssInterop: jest.fn(),
  remapProps: jest.fn(),
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    getFlag: jest.fn(),
    register: jest.fn(),
  },
};
