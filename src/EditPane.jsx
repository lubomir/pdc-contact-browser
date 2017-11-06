'use strict';

var React = require('react');
var Select = require('react-select');
var $ = require('jquery');
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
      'initContact': '',
      'role': '',
      'initRole': '',
      'enableContactSelect': false,
      'enableRoleSelect': false,
      'enableSaveBtn': false
    };
  },
  componentDidMount: function(){
    var _this = this;
    $('.rightCol').on('selectContact', function(event, data) {
      if (data === '') {
        _this.setState({
          'cmp': '',
          'release': '',
          'contact': '',
          'role': '',
          'enableContactSelect': false,
          'enableRoleSelect': false,
          'showMessage': false,
          'message': ''
        });
      } else {
        _this.setState({
          'cmp': data.component,
          'release': data.release,
          'contact': data.contact,
          'initContact': data.contact,
          'role': data.role,
          'initRole': data.role,
          'enableContactSelect': true,
          'enableRoleSelect': true,
          'showMessage': false,
          'message': ''
        });
        _this.targetUrl =  data.url;
      }
    });
    $('#table-toolbar').on('toggleTab', function(event, tab) {
      if (tab !== 'edit') {
        _this.restoreInitValues();
      }
    });

    $('.wrapper').on('dataUpdated', function(event) {
      if (event.crud === 'delete' && _this.state.contact !== '') {
        _this.restoreDefaults();
      }
    });
  },
  restoreInitValues: function() {
    this.setState({
      'showMessage': false,
      'message': '',
      'contact': this.state.initContact,
      'role': this.state.initRole
    });
  },
  componentWillUnmount: function () {
    $('.rightCol').off('selectContact');
  },
  updateFieldContact: function(value) {
    this.setState({ 'contact': value.trim(), 'enableSaveBtn': (value.trim() !== this.state.contact) ? true : false });
  },
  updateFieldRole: function(value) {
    this.setState({ 'role': value.trim(), 'enableSaveBtn': (value.trim() !== this.state.role) ? true : false });
  },
  restoreDefaults: function() {
    this.setState({
      'showMessage': false,
      'message': '',
      'cmp': '',
      'release': '',
      'contact': '',
      'initContact': '',
      'role': '',
      'initRole': '',
      'enableContactSelect': false,
      'enableRoleSelect': false,
      'enableSaveBtn': false
    });
  },
  closePane: function() {
    this.restoreInitValues();
    this.props.hidePanel();
  },
  displayMessage: function(msg, duration) {
    var _this = this;
    if (duration) {
      this.setState({ 'message': msg, 'showMessage': true, 'messageType': 'success' }, function() {
        setTimeout(function() {
          _this.setState({ 'showMessage': false });
          setTimeout(function() {
            _this.setState({ 'messageType': 'danger'});
          }, 151);
        }, duration);
      });
    } else {
      this.setState({ 'message': msg, 'showMessage': true });
    }
  },
  validateData: function() {
    var _this = this;
    var newData = [
      { 'name': 'contact', 'value': this.state.contact },
      { 'name': 'role', 'value': this.state.role }
    ];

    var failed = newData.some(function(item) {
      if(!item.value.length) {
        _this.setState({ 'message': item.name + ' is required.' }, function() {
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
  updateContact: function() {
    var _this = this;
    if (!this.validateData()) {
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
    data['role'] = row['role'];
    if (row['release'] == 'N/A') {
      data['component'] = row['component'];
    }
    else {
      data['component'] = {'name': row['component'], 'release': row['release']};
    }
    var arr = row['contact'].split('<');
    var name = arr[0].trim();
    var email = arr[1].replace('>', '').trim();
    if ($.inArray(row['contact'], this.converted_mailinglists) >= 0) {
      data['contact'] = { 'mail_name': name, 'email': email };
    }
    else if ($.inArray(row["contact"], this.converted_people) >= 0) {
      data['contact'] = { 'username': name, 'email': email };
    }
    else {
      this.displayMessage('Something wrong with the contacts');
    }
    $.ajax({
      url: this.targetUrl,
      dataType: 'json',
      contentType: 'application/json',
      method: 'PUT',
      data: JSON.stringify(data),
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Token ' + localStorage.getItem('token'));
      }
    })
    .done(function (response) {
      $('.wrapper').trigger({ 'type': 'dataUpdated', 'crud': 'update' });
      _this.displayMessage('Record is updated successfully on server side.', 3000);
    })
    .fail(function (response) {
      _this.displayMessage(response.responseText);
    })
    .always(function() {
      _this.setState({ 'enableSaveBtn': false });
    });
  },
  getUniqueArray: function(arr) {
    var result = [];
    $.each(arr, function(i, item) {
        if ($.inArray(item, result) == -1) result.push(item);
    });
    return result;
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
    var finalContact = this.getUniqueArray(converted_mailinglists.concat(converted_people));
    var contactList = finalContact.map(function(contact) {
      return { 'value': contact, 'label': contact };
    });
    var releaseList = this.props.releases.map(function(release) {
      return { 'value': release, 'label': release };
    });
    var roleList = this.props.roles.map(function(role) {
      return { 'value': role, 'label': role };
    });

    return (
      <div>
        <Row className="fieldsRow">
          <Col md={3}>
            <FormControl ref="cmp" type="text" placeholder="Component" value={this.state.cmp} disabled="true"/>
          </Col>
          <Col md={2}>
            <FormControl ref="release" type="text" placeholder="Release" value={this.state.release} disabled="true"/>
          </Col>
          <Col md={5}>
            <Select ref="contact" placeholder="Contact" value={this.state.contact} clearable={false} options={contactList} disabled={!this.state.enableContactSelect} onChange={this.updateFieldContact}/>
          </Col>
          <Col md={2}>
            <Select placeholder="Role" value={this.state.role} clearable={false} options={roleList} disabled={!this.state.enableRoleSelect} onChange={this.updateFieldRole}/>
          </Col>
        </Row>
        <Row className="btnsRow">
          <Col md={10}>
            <Fade in={this.state.showMessage}>
              <Alert bsStyle={this.state.messageType}>
                {this.state.message}
              </Alert>
            </Fade>
          </Col>
          <Col md={2}>
            <ButtonGroup bsSize="small" justified>
              <Button href="#" bsStyle="success" onClick={this.updateContact} disabled={!this.state.enableSaveBtn}>Save</Button>
              <Button href="#" onClick={this.closePane}>Cancel</Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>
    );
  }
});