'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var SpinnerLoader = require('./SpinnerLoader.jsx');
var $ = require('jquery');

module.exports = React.createClass({
  handleSubmit: function (e) {
    e.preventDefault();
    var data = {
      'component': ReactDOM.findDOMNode(this.refs.component).value.trim(),
      'release': ReactDOM.findDOMNode(this.refs.release).value,
      'role': ReactDOM.findDOMNode(this.refs.role).value
    };
    this.props.onSubmit(data);
  },
  handleInputChange: function () {
    this.props.inputChange();
  },
  setItem: function (item) {
    var value = (this.props.params[item]) ? this.props.params[item]:"all";
    $("#" + item +" option[value='" + value + "']").attr('selected','selected');
  },
  render: function () {
    var rel = this.props.releases;
    if ($.inArray("global", rel) < 0) {
      rel.unshift("global");
    }
    if ($.inArray("all", rel) < 0) {
      rel.unshift("all");
    }
    var releases = rel.map(function (val) {
      return <option key={val} value={val}>{val}</option>;
    });
    var r = this.props.roles;
    if ($.inArray("all", r) < 0) {
      r.unshift("all");
    }
    var roles = r.map(function (val) {
      return <option key={val} value={val}>{val}</option>;
    });
    var component = (this.props.params['component']) ? this.props.params['component']:"";
    $("#component").attr("value", component);
    if (this.props.resource == "global-component-contacts/") {
      $("#release option[value='global']").attr('selected','selected');
    }
    else {
      this.setItem("release");
    }
    this.setItem("role");
    var release_spinning = this.props.release_spinning;
    var role_spinning =  this.props.role_spinning;
    return (
      <Row className="loadForm">
        <Col md={12}>
          <h2 className="text-center">Contact Browser</h2>
          <form className="form-horizontal" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label htmlFor="component" className="col-md-6 control-label">Component:</label>
              <div className="col-md-6">
                <input type="text" className="form-control" id="component" ref="component" onChange={this.handleInputChange}/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="release" className="col-md-6 control-label">Release:</label>
              <Col md={6} >
                  <select className="form-control" id="release" ref="release" required="required" onChange={this.handleInputChange}>
                     {releases}
                  </select>
              </Col>
              <SpinnerLoader enabled={release_spinning} />
            </div>
            <div className="form-group">
              <label htmlFor="role" className="col-md-6 control-label">Contact Role:</label>
              <Col md={6} >
                <select className="form-control" id="role" ref="role" required="required" onChange={this.handleInputChange} >
                  {roles}
                </select>
              </Col>
              <SpinnerLoader enabled={role_spinning} />
            </div>
            <div className="form-group">
              <Col md={8} mdOffset={2} className="text-center">
                <Button type="submit">Search</Button>
              </Col>
            </div>
          </form>
        </Col>
      </Row>
    );
  }
});