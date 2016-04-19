'use strict';

var React = require('react');

module.exports = React.createClass({
  render: function () {
    if (this.props.enabled) {
      return (<div className='spinner-loader'></div>);
    } else {
      return (<div />);
    }
  }
});