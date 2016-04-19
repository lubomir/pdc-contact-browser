'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;
var $ = require('jquery');

module.exports = React.createClass({
  onAfterDeleteRow: function(rowKeys) {
    $.ajaxSetup({
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Token ' + localStorage.getItem('token'));
      }
    });
    $.ajax({
      url: rowKeys[0],
      method: "DELETE",
      success: function (response) {
        this.props.onUpdate(this.props.resource, this.props.params);
        window.alert("Record is deleted successfully on server.");
      }.bind(this),
      error: function (response) {
        this.props.onUpdate(this.props.resource, this.props.params);
        window.alert(response.responseText);
      }.bind(this)
    });
  },
    onAfterInsertRow: function(row) {
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
        throw "Something wrong with the contacts";
      }
      $.ajaxSetup({
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', 'Token ' + localStorage.getItem('token'));
        }
      });
      $.ajax({
        url: url,
        dataType: "json",
        contentType: 'application/json',
        method: "POST",
        data: JSON.stringify(data),
        success: function (response) {
          this.props.onUpdate(this.props.resource, this.props.params);
          window.alert("Record is created successfully on server.");
        }.bind(this),
        error: function (response) {
          this.props.onUpdate(this.props.resource, this.props.params);
          window.alert(response.responseText);
        }.bind(this)
      });
    },
    render: function () {
      if (!this.props.showresult) {
        return <div />;
      }
      if (this.props.roles[0] == "all") {
        this.props.roles.shift();
      }
      if (this.props.releases[0] == "all") {
        this.props.releases.shift();
      }
      var role_editable = {
        type: "select",
        options:{
          values: this.props.roles
        }
      };
      var release_editable = {
        type: "select",
        options:{
          values: this.props.releases
        }
      };
      var mailinglists = this.props.contacts["mail"];
      var people = this.props.contacts["people"];
      var converted_mailinglists = [];
      var converted_people = [];
      for (var idx in mailinglists) {
        converted_mailinglists.push(mailinglists[idx].mail_name + " <" + mailinglists[idx].email + ">");
      }
      for (var idx in people) {
        converted_people.push(people[idx].username + " <" + people[idx].email + ">");
      }
      var converted_contacts = converted_mailinglists.concat(converted_people);
      this.converted_mailinglists = converted_mailinglists;
      this.converted_people = converted_people;
      this.converted_contacts = converted_contacts;
      var contact_editable = {
        type: "select",
        options:{
          values: converted_contacts
        }
      };
      var selectRowProp = {
        mode: "radio",
        clickToSelect: true
      };
      var options = {
        afterDeleteRow: this.onAfterDeleteRow,
        afterInsertRow: this.onAfterInsertRow
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
        <BootstrapTable height={"auto"} data={contacts} striped={true} hover={true} condensed={true} insertRow={true} deleteRow={true} selectRow={selectRowProp} options={options}>
          <TableHeaderColumn dataField="url" isKey={true} autoValue={true} hidden={true}>Url</TableHeaderColumn>
          <TableHeaderColumn dataField="component" dataAlign="center" width="80">Component</TableHeaderColumn>
          <TableHeaderColumn dataField="release" dataAlign="center" editable={release_editable} width="60">Release</TableHeaderColumn>
          <TableHeaderColumn dataField="contact" dataAlign="center" editable={contact_editable} width="180">Contact</TableHeaderColumn>
          <TableHeaderColumn dataField="role" dataAlign="center" editable={role_editable} width="60">Contact Role</TableHeaderColumn>
        </BootstrapTable>
      );
    }
});