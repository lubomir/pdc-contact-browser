'use strict';

var React = require('react');
var NewPane = require('./NewPane.jsx');
var EditPane = require('./EditPane.jsx');
import { Row, Col, Tab, Nav, NavItem, Glyphicon, Alert, ButtonGroup, Button } from 'react-bootstrap';
var $ = require('jquery');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      'activeKey': '',
      'panelClass': '',
      'delMessageType': 'info',
      'delMessage': 'Please select one contact firstly.',
      'showDelBtn': false,
      'enableDelBtn': true
    };
  },
  componentDidMount: function(){
    var _this = this;
    $('.rightCol').on('selectContact', function(event, data) {
      if (data === '') {
        _this.setState({ 'delMessageType': 'info', 'delMessage': 'Please select one contact firstly.', 'showDelBtn': false });
      } else {
        _this.setState({ 'delMessageType': 'danger', 'delMessage': 'Are you sure to delete the selected contact?', 'showDelBtn': true });
      }
    });
  },
  selectActionButton: function(eventKey) {
    this.setState({ 'activeKey': eventKey, 'panelClass': 'show-panel' });
    if (eventKey === 'new') {
      $('#table-toolbar').trigger('newContact');
    } else if (eventKey === 'delete') {
      if (this.props.selectedContact.url) {
        this.setState({ 'delMessageType': 'danger', 'delMessage': 'Are you sure to delete the selected contact?', 'showDelBtn': true });
      } else {
        this.setState({ 'delMessageType': 'info', 'delMessage': 'Please select one contact firstly.', 'showDelBtn': false });
      }
    }
  },
  hidePanel: function() {
    this.setState({ 'activeKey': '', 'panelClass': '' });
  },
  deleteContact: function() {
    var _this = this;
    this.setState({ 'enableDelBtn': false });

    $.ajax({
      url: this.props.selectedContact.url,
      method: 'DELETE',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Token ' + localStorage.getItem('token'));
      }
    })
    .done(function (response) {
      $('.wrapper').trigger({ 'type': 'dataUpdated', 'crud': 'delete' });
      _this.props.clearSelectedContact();
      _this.setState({ 'delMessageType': 'success', 'delMessage': 'Record is deleted successfully on server.', 'showDelBtn': false });
    })
    .fail(function (response) {
      _this.setState({ 'delMessageType': 'danger', 'delMessage': response.responseText });
    })
    .always(function() {
      _this.setState({ 'enableDelBtn': true });
    });
  },
  render: function () {
    if (!this.props.showresult) {
      return <div />;
    }
    return (
      <Row>
        <Col md={12}>
          <Tab.Container id="table-toolbar" onSelect={this.selectActionButton} activeKey={this.state.activeKey}>
            <Col>
              <Nav bsStyle="pills" >
                <NavItem eventKey="new">
                  <Glyphicon glyph="plus" /> New
                </NavItem>
                <NavItem eventKey="edit">
                  <Glyphicon glyph="pencil" /> Edit
                </NavItem>
                <NavItem eventKey="delete">
                  <Glyphicon glyph="trash" /> Delete
                </NavItem>
              </Nav>
              <Tab.Content animation className={this.state.panelClass}>
                <Tab.Pane eventKey="new">
                  <NewPane releases={this.props.releases} roles={this.props.roles} 
                  contacts={this.props.contacts} hidePanel={this.hidePanel} />
                </Tab.Pane>
                <Tab.Pane eventKey="edit">
                  <EditPane releases={this.props.releases} roles={this.props.roles}
                    contacts={this.props.contacts} hidePanel={this.hidePanel} />
                </Tab.Pane>
                <Tab.Pane eventKey="delete">
                <Row>
                  <Col md={10}>
                    <Alert bsStyle={this.state.delMessageType}>
                      {this.state.delMessage}
                    </Alert>
                  </Col>
                  <Col md={2}>
                    { this.state.showDelBtn ?
                      <ButtonGroup bsSize="small" justified>
                        <Button href="#" bsStyle="success" onClick={this.deleteContact} disabled={!this.state.enableDelBtn}>Yes</Button>
                        <Button href="#" onClick={this.hidePanel}>No</Button>
                      </ButtonGroup>
                      : null
                    }
                  </Col>
                  </Row>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Tab.Container>
        </Col>
      </Row>
    );
  }
});