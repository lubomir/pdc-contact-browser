'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;

module.exports = React.createClass({
  getInitialState: function (){
    return { showModal: false };
  },
  open: function (){
    this.setState({ showModal: true });
  },
  close: function () {
    this.setState({ showModal: false });
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
      <Modal show={this.state.showModal} className="error-dialog" onHide={this.close}>
        <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
        <Modal.Body>
          <p><b>{this.props.data.method}</b> <code>{this.props.data.url}</code></p>
          {resp}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.close}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});