'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var classNames = require('classnames');
var Select = require('react-select');
var $ = require('jquery');

module.exports = React.createClass({
  handleSubmit: function (e) {
    e.preventDefault();
    var data = {
      'component': ReactDOM.findDOMNode(this.refs.component).value.trim(),
      'release': $('input[name="query_release"]').val(),
      'role': $('input[name="query_role"]').val()
    };
    this.props.onSubmit(data);
  },
  handleInputChange: function () {
    this.props.inputChange();
  },
  render: function () {
    var rel = this.props.releases;
    if ($.inArray("global", rel) < 0) {
      rel.unshift("global");
    }
    if ($.inArray("all", rel) < 0) {
      rel.unshift("all");
    }
    var releaseList = rel.map(function(release) {
      return { 'value': release, 'label': release };
    });
    var r = this.props.roles;
    if ($.inArray("all", r) < 0) {
      r.unshift("all");
    }
    var roleList = r.map(function(role) {
      return { 'value': role, 'label': role };
    });
    var component = (this.props.params['component']) ? this.props.params['component']:"";
    $("#component").attr("value", component);
    var initRelease = '';
    if (this.props.resource == "global-component-contacts/") {
      initRelease = 'global';
    }
    else if (this.props.params['release']) {
      initRelease = this.props.params['release'];
    } else {
      initRelease = 'all';
    }
    var initRole = (this.props.params['role']) ? this.props.params['role'] : 'all';
    var release_spinning = this.props.release_spinning;
    var role_spinning =  this.props.role_spinning;

    var releaseSpinClass = classNames({
      'fa': true,
      'fa-refresh': true,
      'fa-spin': true,
      'loadingSpinner': true,
      'hidden': !release_spinning
    });
    var roleSpinClass = classNames({
      'fa': true,
      'fa-refresh': true,
      'fa-spin': true,
      'loadingSpinner': true,
      'hidden': !role_spinning
    });
    return (
      <Row className="loadForm">
        <Col md={12}>
          <form className="form-horizontal" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label htmlFor="component" className="col-md-12">Component:</label>
              <div className="col-md-12">
                <input type="text" className="form-control" id="component" ref="component" onChange={this.handleInputChange}/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="release" className="col-md-12">Release:</label>
              <Col md={12}>
                <Select name="query_release" value={initRelease} clearable={false} options={releaseList}/>
                <i className={releaseSpinClass}></i>
              </Col>
            </div>
            <div className="form-group">
              <label htmlFor="role" className="col-md-12">Contact Role:</label>
              <Col md={12}>
                <Select name="query_role" value={initRole} clearable={false} options={roleList}/>
                <i className={roleSpinClass}></i>
              </Col>
            </div>
            <div className="form-group">
              <Col md={12}>
                <Button type="submit" className="btn-primary" id="search-contacts">Search</Button>
              </Col>
            </div>
          </form>
        </Col>
      </Row>
    );
  }
});