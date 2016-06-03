'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var Navbar = ReactBootstrap.Navbar;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var $ = require('jquery');

var LoadForm = require('./LoadForm.jsx');
var TableToolbar = require('./TableToolbar.jsx');
var Browser = require('./Browser.jsx');
var Pager = require('./Pager.jsx');
var NetworkErrorDialog = require('./NetworkErrorDialog.jsx');
var Spinner = require('./Spinner.jsx');

module.exports = React.createClass({
  getInitialState: function () {
    var cached_releases = localStorage.getItem("releases");
    var cached_roles = localStorage.getItem("roles");
    var busy = true;
    var releases = [];
    var roles = [];
    var release_spinning = false;
    var role_spinning = false;
    if (cached_releases && cached_roles) {
      busy = false;
      releases = cached_releases.split(",");
      roles = cached_roles.split(",");
      release_spinning = true;
      role_spinning = true;
    }
    var params = {};
    var resource= null;
    var location = document.location.toString();
    var res = location.split("#");
    var root = res[0] + "#/";
    if (res[1]) {
      var inputs = res[1].split("?");
      resource = inputs[0].replace("/", "");
      if (inputs[1]) {
        var arrs = inputs[1].split("&");
        for (var index in arrs) {
          var param_arrs = arrs[index].split("=");
          if (param_arrs[1]) {
            params[param_arrs[0]] = param_arrs[1];
          }
        }
      }
    }
    return {
      count: 0,
      data: [],
      url: null,
      params: params,
      page: 1,
      page_size: 10,
      busy: busy,
      error: {},
      showresult: false,
      releases: releases,
      roles: roles,
      release_spinning: release_spinning,
      role_spinning: role_spinning,
      root: root,
      resource: resource,
      contacts: {},
      selectedContact: {}
    };
  },
  componentDidMount: function() {
    var self = this;
    $.ajaxSetup({beforeSend: function(xhr){
        if (xhr.overrideMimeType){ 
            xhr.overrideMimeType("application/json");
        }
      }
    });
    $.getJSON("serversetting.json", function( data ) {
      localStorage.setItem('server', data['server']);
      self.state.url = data['server'];
      handleData();
    });
    function handleData() {
      var token = localStorage.getItem('token');
      if (!token) {
        self.getToken(self.getInitialData);
      }
      else {
        self.getInitialData(token);
      }
      if (self.state.resource) {
        var allowed_params = ["component", "release", "role", "page", "page_size"];
        var params = Object.keys(self.state.params);
        for (var idx in params) {
          if ($.inArray(params[idx], allowed_params) < 0) {
            throw "Input params should be in list 'component', 'release', 'role' or 'page'";
          }
        }
        var page = 1;
        if (self.state.params['page']) {
          page = self.state.params['page'];
        }
        self.setState({busy: true, page: Number(page), release_spinning: false, role_spinning: false, showresult: true}, self.loadData);
      }
    }

    $('.wrapper').on('historyChange', function(event, location) {
      if (location.query.page > 0) {
        self.setState({
          'params': location.query,
          'resource': location.pathname.indexOf('/') === 0 ? location.pathname.slice(1): location.pathname
        }, function() {
          self.loadData(parseInt(location.query.page));
        });
      } else {
        self.setState({ 'params': '', 'resource': '', 'showresult': false });
      }
    });
  },
  getToken: function (getInitialData) {
    var url = localStorage.getItem('server') + 'auth/token/obtain/';
    var x = new XMLHttpRequest();
    x.open('GET', url, true);
    x.withCredentials = true;
    x.setRequestHeader('Accept', 'application/json');
    x.addEventListener("load", function () {
      var data = JSON.parse(x.response);
      getInitialData(data.token);
      localStorage.setItem('token', data.token);
    });
    x.addEventListener("error", function () {
      document.write('Authorization Required');
    });
    x.send();
  },
  getInitialData: function (token) {
    $.ajaxSetup({
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Token ' + token);
      }
    });
    var releases = [];
    var roles = [];
    var mailinglists = [];
    var people = [];
    var param = {};
    param["page_size"] = -1;
    var Url = localStorage.getItem('server');
    $.when(
      $.getJSON(Url + "releases/", param, function (response) {
        for (var idx in response) {
          releases.push(response[idx].release_id)
        }
      }),
      $.getJSON(Url + "contact-roles/", param, function (response) {
        for (var idx in response) {
          roles.push(response[idx].name);
        }
      }),
      $.getJSON(Url + "contacts/mailing-lists/", param, function (response) {
        mailinglists = response;
      }),
      $.getJSON(Url + "contacts/people/", param, function (response) {
        people = response;
      })
    ).then( function () {
      var contacts = {};
      contacts["mail"] = mailinglists;
      contacts["people"] = people;
      this.setState({busy: false,
                    releases: releases,
                    roles: roles,
                    release_spinning: false,
                    role_spinning: false,
                    contacts: contacts});
      localStorage.setItem('releases', releases);
      localStorage.setItem('roles', roles);
    }.bind(this), function(xhr, status, err) {
      if (err == "UNAUTHORIZED") {
        this.setState({busy: true,
                        release_spinning: false,
                        role_spinning: false});
        this.getToken(this.getInitialData);
      }
      else {
        this.displayError(Url, 'GET', xhr, status, err);
      }
    }.bind(this));
  },
  displayError: function (url, method, xhr, status, err) {
    console.log(url, status, err);
    this.setState({
      busy: false,
      error: {
        url: url,
        xhr: xhr,
        status: status,
        err: err,
        method: method
      }
    });
  },
  handleFormSubmit: function (data) {
    var params = {};
    var resource = null;
    if (data['release'] == 'global') {
      resource = 'global-component-contacts/';
    }
    else {
      resource = 'release-component-contacts/';
      if(data['release'] != 'all') {
        params['release'] = data['release'];
      }
    }
    if (data['component']) {
      params['component'] = data['component'];
    }
    if (data['role'] != 'all') {
      params['role'] = data['role'];
    }

    this.setState({resource: resource, params: params, page: 1, showresult: true}, this.handlePageChange(1));
    },
    updateData: function (resource, params, showLastPage) {
      this.setState({resource: resource, params: params, showresult: true}, this.loadData(showLastPage));
    },
    loadData: function (showLastPage) {
      this.setState({busy: true});
      $.ajax({
        url: this.state.url + this.state.resource,
        dataType: "json",
        data: this.state.params,
        success: function (response) {
          this.setState({
            busy: false,
            showresult: true,
            data: response.results,
            count: response.count,
            page: parseInt(this.state.params.page),
            next: response.next,
            prev: response.prev}, function() {
              var params = this.state.params;
              if (params['component']) {
                $('#component').val(params['component']);
              } else {
                $('#component').val('');
              }
              if (params['release']) {
                $('#release').val(params['release']);
              } else if (this.state.resource === 'global-component-contacts/') {
                $('#release').val('global');
              } else {
                $('#release').val('all');
              }
              if (params['role']) {
                $('#role').val(params['role']);
              } else {
                $('#role').val('all');
              }
            }
          );
        }.bind(this),
        error: function (xhr, status, err) {
          this.displayError(this.state.url, 'GET', xhr, status, err);
        }.bind(this)
      });
    },
    handlePageChange: function (p) {
      var _this = this;
      this.setState({page: p}, function() {
        var arr = [];
        var params = _this.state.params
        params.page = p;
        params.page_size = _this.state.page_size;
        for (var key in params) {
          arr.push(key + '=' + params[key]);
        }
        _this.context.router.push(_this.state.resource + '?' + arr.join('&'));
      });
    },
    handleInputChange: function () {
      this.setState({url: localStorage.getItem('server')});
    },
    clearError: function () {
      this.setState({error: {}});
    },
    onSelectContact: function(contact) {
      this.setState({ 'selectedContact': contact });
      $('.rightCol').trigger('selectContact', [contact]);
    },
    clearSelectedContact: function() {
      this.setState({ 'selectedContact': {} });
    },
    contextTypes: {
      router: React.PropTypes.object.isRequired
    },
    render: function () {
      return (
        <div className="container-fluid wrapper">
          <Navbar inverse>
            <Navbar.Header>
              <Navbar.Brand>
                Contact Browser
              </Navbar.Brand>
            </Navbar.Header>
          </Navbar>
          <Row className="layout">
            <Col md={3} className="leftCol">
              <LoadForm releases={this.state.releases} roles={this.state.roles} release_spinning={this.state.release_spinning} role_spinning={this.state.role_spinning} params={this.state.params} resource={this.state.resource} onSubmit={this.handleFormSubmit} inputChange={this.handleInputChange}/>
            </Col>
            <Col md={9} className="rightCol">
              <TableToolbar showresult={this.state.showresult} releases={this.state.releases} roles={this.state.roles} contacts={this.state.contacts} resource={this.state.resource} params={this.state.params}
                onUpdate={this.updateData} selectedContact={this.state.selectedContact} clearSelectedContact={this.clearSelectedContact}/>
              <Browser data={this.state.data} showresult={this.state.showresult} onSelectContact={this.onSelectContact}/>
              <Pager count={this.state.count} showresult={this.state.showresult} page={this.state.page} page_size={this.state.page_size} onPageChange={this.handlePageChange} />
            </Col>
          </Row>
          <Spinner enabled={this.state.busy} />
          <NetworkErrorDialog onClose={this.clearError} data={this.state.error} />
        </div>
      );
    }
});
