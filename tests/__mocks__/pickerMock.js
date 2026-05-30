const React = require('react');

const Picker = ({ children, testID, selectedValue, onValueChange, enabled }) =>
  React.createElement('Picker', { testID, selectedValue, onValueChange, enabled }, children);

Picker.Item = ({ label, value }) => React.createElement('PickerItem', { value }, label);

module.exports = {
  __esModule: true,
  Picker,
  default: {
    Picker,
  },
};
