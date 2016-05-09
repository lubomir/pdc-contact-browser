'use strict';

var React = require('react');
var Select = require('react-select');
import {Row, Col, Tab, Nav, NavItem, FormGroup, ControlLabel, FormControl, ButtonGroup, Button, Glyphicon, Alert, Fade} from 'react-bootstrap';

module.exports = React.createClass({
  getInitialState: function() {
    return {
      'showMessage': false,
      'message': '',
      'messageType': 'danger',
      'cmp': '',
      'release': '',
      'contact': '',
      'role': '',
      'enableSaveBtn': true
    };
  },
  updateCmp: function(event) {
    this.setState({ 'cmp': event.target.value.trim() });
  },
  updateRelease: function(value) {
    this.setState({ 'release': value.trim() });
  },
  updateContact: function(value, item) {
    this.setState({ 'contact': item[0].value.trim() });
  },
  updateRole: function(event) {
    this.setState({ 'role': event.target.value.trim() });
  },
  restoreDefaults: function() {
    this.setState({ 'cmp': '', 'release': '', 'contact': '', 'role': '' });
  },
  closePane: function() {
    this.restoreDefaults();
    this.props.hidePanel();
  },
  displayMessage: function(msg, duration) {
    var _this = this;
    if (duration) {
      this.setState({ 'message': msg, 'showMessage': true, 'messageType': 'success' }, function() {
        setTimeout(function() {
          _this.setState({ 'messageType': 'danger', 'showMessage': false });
        }, duration);
      });
    } else {
      this.setState({ 'message': msg, 'showMessage': true });
    }
  },
  validateNewData: function() {
    var _this = this;
    var newData = [
      { 'name': 'cmp', 'value': this.state.cmp },
      { 'name': 'release', 'value': this.state.release },
      { 'name': 'contact', 'value': this.state.contact },
      { 'name': 'role', 'value': this.state.role }
    ];

    var failed = newData.some(function(item) {
      if(!item.value.length) {
          _this.setState({ 'message': (item.name === 'cmp' ? 'Component' : item.name) + ' is required.' }, function() {
            _this.setState({ 'showMessage': true });
          });
          return true;
      }
    });

    if (failed) {
      this.setState({ 'showMessage': true });
    }
    return !failed;
  },
  addContact: function() {
    var _this = this;
    if (!this.validateNewData()) {
      return;
    } else {
      this.setState({ 'enableSaveBtn': false });
    }
    var row = {
      'component': this.state.cmp,
      'release': this.state.release,
      'contact': this.state.contact,
      'role': this.state.role
    };
    var data = {};
    var url = localStorage.getItem('server');
    data["role"] = row["role"];
    if (row["release"] == "global") {
      data["component"] = row["component"];
      url = url + "global-component-contacts/";
    }
    else {
      data["component"] = {"name": row["component"], "release": row["release"]};
      url = url + "release-component-contacts/";
    }
    var arr = row["contact"].split("<");
    var name = arr[0].trim();
    var email = arr[1].replace(">", "").trim();
    if ($.inArray(row["contact"], this.converted_mailinglists) >= 0) {
      data["contact"] = {"mail_name": name, "email": email};
    }
    else if ($.inArray(row["contact"], this.converted_people) >= 0) {
      data["contact"] = {"username": name, "email": email};
    }
    else {
      this.displayMessage('Something wrong with the contacts');
    }
    $.ajax({
      url: url,
      dataType: "json",
      contentType: 'application/json',
      method: "POST",
      data: JSON.stringify(data),
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Token ' + localStorage.getItem('token'));
      }
    })
    .done(function (response) {
      _this.props.onUpdate(_this.props.resource, _this.props.params);
      _this.displayMessage('Record is created successfully on server.', 3000);
      _this.restoreDefaults();
    })
    .fail(function (response) {
      _this.displayMessage(response.responseText);
    })
    .always(function() {
      _this.setState({ 'enableSaveBtn': true });
    });
  },
  render: function () {
    if (this.props.roles[0] == "all") {
      this.props.roles.shift();
    }
    if (this.props.releases[0] == "all") {
      this.props.releases.shift();
    }

    var mailinglists = this.props.contacts["mail"];
    var people = this.props.contacts["people"];
    var converted_mailinglists = [];
    var converted_people = [];
    for (var idx in mailinglists) {
      converted_mailinglists.push(mailinglists[idx].mail_name + " <" + mailinglists[idx].email + ">");
    }
    this.converted_mailinglists = converted_mailinglists;
    for (var idx in people) {
      converted_people.push(people[idx].username + " <" + people[idx].email + ">");
    }
    this.converted_people = converted_people;
    var contactList = converted_mailinglists.concat(converted_people).map(function(contact, index) {
      return { 'value': contact, 'label': contact, 'index': index };
    });
    var releaseList = this.props.releases.map(function(release) {
      return { 'value': release, 'label': release };
    });

    return (
      <div>
        <Row>
          <Col md={2}>
            <FormControl type="text" value={this.state.cmp} placeholder="Component" onChange={this.updateCmp} />
          </Col>
          <Col md={2}>
            <Select placeholder="Release" name="field_release" value={this.state.release} clearable={false} options={releaseList} onChange={this.updateRelease}/>
          </Col>
          <Col md={6}>
            <Select placeholder="Contact" valueKey="index" value={this.state.contact} clearable={false} options={contactList} onChange={this.updateContact}/>
          </Col>
          <Col md={2}>
            <FormControl componentClass="select" value={this.state.role} onChange={this.updateRole}>
              <option value="" defaultValue disabled>Contact Role</option>
              <option value="QE_Group">QE_Group</option>
              <option value="QE_Leader">QE_Leader</option>
              <option value="QE_ACK">QE_ACK</option>
              <option value="Build_Owner">Build_Owner</option>
              <option value="Devel_Owner">Devel_Owner</option>
            </FormControl>
          </Col>
        </Row>
        <Row>
          <Col md={10}>
            <Fade in={this.state.showMessage}>
              <Alert bsStyle={this.state.messageType}>
                {this.state.message}
              </Alert>
            </Fade>
          </Col>
          <Col md={2}>
            <ButtonGroup bsSize="small" justified>
              <Button href="#" bsStyle="success" onClick={this.addContact} disabled={!this.state.enableSaveBtn}>Save</Button>
              <Button href="#" onClick={this.closePane}>Cancel</Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>
    );
  }
});