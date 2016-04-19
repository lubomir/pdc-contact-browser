'use strict';

var React = require('react');

module.exports = React.createClass({
  render: function () {
    if (this.props.enabled) {
      return (
        <div className='overlay'>
          <div className='spinner-loader'>Loading …</div>
        </div>
      );
    } else {
      return (<div />);
    }
  }
});