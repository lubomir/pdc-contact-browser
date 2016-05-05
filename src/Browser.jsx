'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;
var $ = require('jquery');

module.exports = React.createClass({
    render: function () {
      var _this = this;
      if (!this.props.showresult) {
        return <div />;
      }

      var selectRowProp = {
        mode: "radio",
        clickToSelect: true,
        bgColor: "rgb(238, 193, 213)",
        onSelect: function (row, isSelected){
          if (isSelected) {
            _this.props.onSelectContact(row.url);
          } else {
            _this.props.onSelectContact('');
          }
        }
      };
      var contacts = this.props.data.map(function (c) {
        var release = null;
        var component = null;
        var contact = null;
        var id = null;
        var url = localStorage.getItem('server');
        if (c.component.release) {
          release = c.component.release;
          component = c.component.name;
          url = url + "release-component-contacts/" + c.id + "/";
        }
        else {
          release = "N/A";
          component = c.component;
          url = url + 'global-component-contacts/' + c.id + "/";
        }
        if (c.contact.username) {
          contact = c.contact.username + " <" + c.contact.email + ">";
        }
        else {
          contact = c.contact.mail_name + " <" + c.contact.email + ">";
        }
        return {"component": component, "release": release, "contact": contact, "role": c.role, "url": url};
      });
      return (
        <BootstrapTable height={"auto"} data={contacts} striped={true} hover={true} condensed={true} selectRow={selectRowProp}>
          <TableHeaderColumn dataField="url" isKey={true} autoValue={true} hidden={true}>Url</TableHeaderColumn>
          <TableHeaderColumn dataField="component" dataAlign="center" width="80">Component</TableHeaderColumn>
          <TableHeaderColumn dataField="release" dataAlign="center" width="60">Release</TableHeaderColumn>
          <TableHeaderColumn dataField="contact" dataAlign="center" width="180">Contact</TableHeaderColumn>
          <TableHeaderColumn dataField="role" dataAlign="center" width="60">Contact Role</TableHeaderColumn>
        </BootstrapTable>
      );
    }
});