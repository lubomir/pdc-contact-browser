'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

module.exports = React.createClass({
  handleClose: function () {
    this.props.onClose();
  },
  render: function () {
    if (Object.keys(this.props.data).length == 0) {
      return <div />;
    }
    var title = "Error: " + this.props.data.xhr.status + " " + this.props.data.err;
    var resp = <span />;
    if (this.props.data.xhr.responseJSON) {
      resp = (
        <div>
          <p>The response was:</p>
          <pre>{JSON.stringify(this.props.data.xhr.responseJSON, null, 2)}</pre>
        </div>
      );
    }
    return (
      <Modal
        title={title}
        className="error-dialog"
        onRequestHide={this.handleClose}>
        <div className="modal-body">
          <p><b>{this.props.data.method}</b> <code>{this.props.data.url}</code></p>
          {resp}
        </div>
        <div className='modal-footer'>
          <Button onClick={this.handleClose}>Close</Button>
        </div>
      </Modal>
    );
  }
});