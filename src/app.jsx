'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var Navbar = ReactBootstrap.Navbar;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var $ = require('jquery');

var common = require('./common.jsx');
var LoadForm = require('./LoadForm.jsx');
var TableToolbar = require('./TableToolbar.jsx');
var Browser = require('./Browser.jsx');
var Pager = require('./Pager.jsx');
var NetworkErrorDialog = require('./NetworkErrorDialog.jsx');
var classNames = require('classnames');

// Makes asynchronous requests to get results from given resources.
function fetchResults(app, data, resources, results = [], count = 0, showResults = true) {
  var request_data;
  // Show results or update only item count.
  if (showResults) {
    request_data = data;
  } else {
    request_data = Object.assign({}, data);
    request_data.page = 1;
    request_data.page_size = 1;
  }

  $.ajax({
    url: app.state.url + resources[0],
    dataType: "json",
    data: request_data
  })
    .done(function (response) {
      var newResults = (response instanceof Array) ? response : response.results;
      count += (response instanceof Array) ? newResults.length : response.count;

      if (showResults) {
        var remaining = app.state.page_size - results.length;
        results = results.concat(newResults.slice(0, remaining));
      }

      resources.shift();

      var newState = {
        busy: resources.length > 0,
        showresult: true,
        data: results,
        count: count,
        page: parseInt(app.state.params.page),
      };

      app.setState(newState, function() {
          var params = app.state.params;

          $('#component').val(params['component'] || '');

          if (params['release']) {
            $('#release').val(params['release']);
          } else if (app.state.resource === common.resources.globalComponentContacts) {
            $('#release').val(common.values.releaseAllGlobal);
          } else if (app.state.resource === common.resources.releaseComponentContacts) {
            $('#release').val(common.values.releaseAllRelease);
          } else {
            $('#release').val(common.values.releaseAll);
          }

          $('#role').val(params['role'] || 'all');
        }
      );

      if (resources.length > 0) {
        // Concatenate results from next resource.
        if (results.length < data.page_size) {
          var currentPageCount = Math.ceil(count / app.state.page_size);
          // With paging, it's not possible to request results from an offset,
          // so first few items from resource can repeat on following page.
          data.page = Math.max(1, data.page - currentPageCount);
          fetchResults(app, data, resources, results, count, true);
        } else {
          // If there is no need to show rest of the items, do a request
          // just to get an item count.
          fetchResults(app, data, resources, results, count, false);
        }
      }
    })
    .fail(function (xhr, status, err) {
      if (showResults && xhr.status === 404 && xhr.responseJSON) {
        // If requested page does not exist, do a request just to get an
        // item count.
        fetchResults(app, data, resources, results, count, false);
      } else {
        app.displayError(app.state.url + resources[0], 'GET', xhr, status, err);
        app.refs.errorDialog.open();
      }
    });
}

module.exports = React.createClass({
  getInitialState: function () {
    var cached_releases = localStorage.getItem("releases");
    var cached_roles = localStorage.getItem("roles");
    var cached_contacts = localStorage.getItem("contacts");
    var releases = [];
    var roles = [];
    var contacts = {};
    var release_spinning = true;
    var role_spinning = true;
    var contact_spinning = true;

    if (cached_releases) {
      releases = cached_releases.split(",");
      release_spinning = false;
    }

    if (cached_roles) {
      roles = cached_roles.split(",");
      role_spinning = false;
    }

    if (cached_contacts) {
      try {
        contacts = JSON.parse(cached_mailinglists);
        contact_spinning = false;
      } catch (e) {
      }
    }

    var busy = !release_spinning && !role_spinning && !contact_spinning;
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
      contacts: contacts,
      release_spinning: release_spinning,
      role_spinning: role_spinning,
      contact_spinning: contact_spinning,
      root: root,
      resource: resource,
      selectedContact: {},
      logo: null,
      customStyle: null,
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
      self.state.logo = data['logo'] || null;
      self.state.customStyle = data['customStyle'] || null;
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
        var allowed_params = ["component", "release", "role", "email", "page", "page_size"];
        var params = Object.keys(self.state.params);
        for (var idx in params) {
          if ($.inArray(params[idx], allowed_params) < 0) {
            throw "Input params should be in list 'component', 'release', 'role', 'email' or 'page'";
          }
        }
        var page = 1;
        if (self.state.params['page']) {
          page = self.state.params['page'];
        }
        self.setState({busy: true, page: Number(page), release_spinning: false, role_spinning: false, contact_spinning: false, showresult: true}, self.loadData);
      }
    }

    $('.wrapper').on('historyChange', function(event) {
      if (event.location.query.page > 0) {
        self.setState({
          'params': event.location.query,
          'resource': event.location.pathname.indexOf('/') === 0 ? event.location.pathname.slice(1): event.location.pathname
        }, function() {
          self.loadData();
        });
      } else {
        self.setState({ 'params': '', 'resource': '', 'showresult': false });
      }
    });

    $('.wrapper').on('dataUpdated', self.updateData);
  },
  componentWillUnmount: function () {
    $('.wrapper').off('historyChange dataUpdated');
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
    var _this = this;
    $.ajaxSetup({
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Token ' + token);
      }
    });
    var releases = [];
    var roles = [];
    var mailinglists = [];
    var people = [];
    var param = { 'page_size': -1 };
    var Url = localStorage.getItem('server');
    $.when(
      $.getJSON(Url + "releases/", param)
        .done(function (response) {
          for (var idx in response) {
            releases.push(response[idx].release_id)
          }
        })
        .fail(function(jqxhr, textStatus, error) {
          _this.errorAddress = Url + 'releases/';
        }),
      $.getJSON(Url + "contact-roles/", param)
        .done(function (response) {
          for (var idx in response) {
            roles.push(response[idx].name);
          }
        })
        .fail(function(jqxhr, textStatus, error) {
          _this.errorAddress = Url + 'contact-roles/';
        }),
      $.getJSON(Url + "contacts/mailing-lists/", param)
        .done(function (response) {
          mailinglists = response;
        })
        .fail(function(jqxhr, textStatus, error) {
          _this.errorAddress = Url + 'contacts/mailing-lists/';
        }),
      $.getJSON(Url + "contacts/people/", param)
        .done(function (response) {
          people = response;
        })
        .fail(function(jqxhr, textStatus, error) {
          _this.errorAddress = Url + 'contacts/people/';
        })
    )
    .done(function () {
      var contacts = {};
      contacts["mail"] = mailinglists;
      contacts["people"] = people;
      _this.setState({busy: false,
                    releases: releases,
                    roles: roles,
                    release_spinning: false,
                    role_spinning: false,
                    contact_spinning: false,
                    contacts: contacts});
      localStorage.setItem('releases', releases);
      localStorage.setItem('roles', roles);
      localStorage.setItem('contacts', JSON.stringify(contacts));
    })
    .fail(function(jqxhr, textStatus, error) {
      if (error === 'UNAUTHORIZED') {
        _this.setState({ busy: true, release_spinning: false, role_spinning: false, contact_spinning: false });
        _this.getToken(_this.getInitialData);
      } else {
        _this.displayError(_this.errorAddress, 'GET', jqxhr, textStatus, error);
        _this.refs.errorDialog.open();
      }
    });
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

    if (data['release'] == common.values.releaseAll) {
      resource = common.resources.allComponentContacts;
    } else if (data['release'] == common.values.releaseAllGlobal) {
      resource = common.resources.globalComponentContacts;
    } else if (data['release'] == common.values.releaseAllRelease) {
      resource = common.resources.releaseComponentContacts;
    } else {
      resource = common.resources.releaseComponentContacts;
      params['release'] = data['release'];
    }

    if (data['component']) {
      params['component'] = data['component'];
    }
    if (data['role'] != common.values.rolesAll) {
      params['role'] = data['role'];
    }
    if (data['contact'] != common.values.contactsAll) {
      params['email'] = data['contact'];
    }

    this.setState({resource: resource, params: params, page: 1, showresult: true}, this.handlePageChange(1));
  },
    updateData: function (event) {
      var availablePage = parseInt(this.state.params.page);
      if (event.crud === 'create') {
        if (this.state.count % this.state.page_size) {
          availablePage = Math.ceil(this.state.count / this.state.page_size);
        } else {
          availablePage = (this.state.count / this.state.page_size) + 1;
        }
      } else if (event.crud === 'delete' ) {
        if (this.state.count % this.state.page_size === 1) {
          availablePage = parseInt(this.state.params.page) - 1;
        }
      }
      if (availablePage !== parseInt(this.state.params.page)) {
        this.handlePageChange(availablePage);
      } else {
        this.loadData(availablePage);
      }
    },
    loadData: function (page) {
      var data = $.extend({}, this.state.params);
      if (page) {
        data.page = page;
      }

      var newState = {busy: true};
      if (data.page_size) {
        newState.page_size = data.page_size;
      }
      this.setState(newState);

      var resources = this.state.resource === common.resources.allComponentContacts
        ? [common.resources.globalComponentContacts, common.resources.releaseComponentContacts]
        : [this.state.resource];

      fetchResults(this, data, resources);
    },
    handlePageChange: function (p) {
      var _this = this;
      this.setState({page: p}, function() {
        var arr = [];
        var params = _this.state.params;
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
      var overlayClass = classNames({
        'overlay': true,
        'hidden': !this.state.busy
      });
      var browserSpinnerClass = classNames({
        'fa': true,
        'fa-refresh': true,
        'fa-spin': true,
        'hidden': !this.state.busy,
        'global-spin': !this.state.showresult
      });
      var logo = null;
      var style = null;
      if (this.state.logo) {
          logo = <img src={this.state.logo} className="brand-logo" />;
      }
      if (this.state.customStyle) {
          style = <link rel="stylesheet" type="text/css" href={this.state.customStyle} />;
      }
      return (
        <div>
          {style}
          <Navbar fluid inverse>
            <Navbar.Header>
              <Navbar.Brand>
                {logo}
                Product Definition Center &mdash; Contact Browser
              </Navbar.Brand>
            </Navbar.Header>
          </Navbar>
          <div className="container-fluid wrapper">
            <Row className="layout">
              <Col md={3} className="leftCol">
                <LoadForm releases={this.state.releases} roles={this.state.roles} contacts={this.state.contacts} release_spinning={this.state.release_spinning} role_spinning={this.state.role_spinning} contact_spinning={this.state.contact_spinning} params={this.state.params} resource={this.state.resource} onSubmit={this.handleFormSubmit} inputChange={this.handleInputChange}/>
              </Col>
              <Col md={9} className="rightCol">
                <TableToolbar showresult={this.state.showresult} releases={this.state.releases} roles={this.state.roles} contacts={this.state.contacts}
                  selectedContact={this.state.selectedContact} clearSelectedContact={this.clearSelectedContact}/>
                <div id="browser-wrapper">
                  <i className={browserSpinnerClass}></i>
                  <Browser id="erer" data={this.state.data} showresult={this.state.showresult} onSelectContact={this.onSelectContact}/>
                </div>
                <Pager count={this.state.count} showresult={this.state.showresult} page={this.state.page} page_size={this.state.page_size} onPageChange={this.handlePageChange} reloadPage={this.loadData} />
              </Col>
            </Row>
            <div className={overlayClass}></div>
            <NetworkErrorDialog ref='errorDialog' data={this.state.error} />
          </div>
        </div>
      );
    }
});
