'use strict';

var PAGE_SIZE = 20;

var React = require('react');
var ReactDOM = require('react-dom')
var ReactBootstrap = require('react-bootstrap');
var $ = require('jquery');
var ReactRouter = require('react-router');
var ReactBSTable = require('react-bootstrap-table');
var createHistory = require('history/lib/createHashHistory');

var Button = ReactBootstrap.Button;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Pagination = ReactBootstrap.Pagination;
var Modal = ReactBootstrap.Modal;
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;

var ContactBrowserApp = React.createClass({
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
        $.getJSON( "src/serversetting.json", function( data ) {
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
                var allowed_params = ["component", "release", "role", "page"];
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
                self.setState({busy: true, page: Number(page), release_spinning: false, role_spinning: false, showresult: true},
                          self.loadData);
            }
        }
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
        this.setState({resource: resource, params: params, page: 1, showresult: true},
                      this.loadData);
    },
    updateData: function (resource, params) {
        this.setState({resource: resource, params: params, showresult: true},
                      this.loadData);
    },
    loadData: function () {
        this.setState({busy: true});
        var data = JSON.parse(JSON.stringify(this.state.params));
        data["page"] = this.state.page;
        $.ajax({
            url: this.state.url + this.state.resource,
            dataType: "json",
            data: data,
            success: function (response) {
                var arr = new Array();
                for (var key in data) {
                    arr.push(key + "=" + data[key]);
                }
                var res = this.state.root + this.state.resource + "?" + arr.join("&");
                var state = {};
                state['Url'] = res;
                state['response'] = response;
                if (window.history.pushState) {
                    window.history.pushState(state, "Url", res);
                }
                else {
                    window.location.hash = res;
                }
                this.setState({busy: false,
                              data: response.results,
                              count: response.count,
                              next: response.next,
                              prev: response.prev});
            }.bind(this),
            error: function (xhr, status, err) {
                this.displayError(this.state.url, 'GET', xhr, status, err);
            }.bind(this)
        });
        window.onpopstate = function(event) {
            var params = {};
            var resource = null;
            if (event.state) {
                var response = event.state['response'];
                var url = event.state['Url'];
                var res = url.split("#");
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
                this.setState({busy: false,
                              showresult: true,
                              data: response.results,
                              count: response.count,
                              next: response.next,
                              prev: response.prev});
            }
            else {
                this.setState({busy: false, showresult: false});
            }
            if (params['component']) {
                $("#component").val(params['component']);
            }
            else {
                $("#component").val("");
            }
            if (params['release']) {
                $("#release").val(params['release']);
            }
            else if (resource == "global-component-contacts/") {
                $("#release").val("global");
            }
            else {
                $("#release").val("all");
            }
            if (params['role']) {
                $("#role").val(params['role']);
            }
            else {
                $("#role").val("all");
            }

        }.bind(this);
    },
    handlePageChange: function (p) {
        this.setState({page: p}, this.loadData);
    },
    handleInputChange: function () {
        this.setState({url: localStorage.getItem('server')});
    },
    clearError: function () {
        this.setState({error: {}});
    },
    render: function () {
        return (
            <div className="container-fluid">
                <LoadForm releases={this.state.releases} roles={this.state.roles} release_spinning={this.state.release_spinning} role_spinning={this.state.role_spinning} params={this.state.params} resource={this.state.resource} onSubmit={this.handleFormSubmit} inputChange={this.handleInputChange}/>
                <Pager count={this.state.count} showresult={this.state.showresult} page={this.state.page} onPageChange={this.handlePageChange} />
                <Browser data={this.state.data} showresult={this.state.showresult} resource={this.state.resource} params={this.state.params} releases={this.state.releases} roles={this.state.roles} contacts={this.state.contacts} onUpdate={this.updateData}/>
                <Pager count={this.state.count} showresult={this.state.showresult} page={this.state.page} onPageChange={this.handlePageChange} />
                <Spinner enabled={this.state.busy} />
                <NetworkErrorDialog onClose={this.clearError} data={this.state.error} />
            </div>
        );
    }
});

var NetworkErrorDialog = React.createClass({
    handleClose: function () {
        this.props.onClose();
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
            <Modal
                title={title}
                className="error-dialog"
                onRequestHide={this.handleClose}>
                <div className="modal-body">
                    <p><b>{this.props.data.method}</b> <code>{this.props.data.url}</code></p>
                    {resp}
                </div>
                <div className='modal-footer'>
                    <Button onClick={this.handleClose}>Close</Button>
                </div>
            </Modal>
        );
    }
});

var Spinner = React.createClass({
    render: function () {
        if (this.props.enabled) {
            return (
                <div className='overlay'>
                    <div className='spinner-loader'>Loading …</div>
                </div>
            );
        } else {
            return (<div />);
        }
    }
});

var Spinner_loader = React.createClass({
    render: function () {
        if (this.props.enabled) {
            return (<div className='spinner-loader'></div>);
        } else {
            return (<div />);
        }
    }
});

var Pager = React.createClass({
    handlePageChange: function (event, selectedEvent) {
        event.preventDefault()
        this.props.onPageChange(selectedEvent.eventKey);
    },
    render: function () {
        if (this.props.count == 0 || !this.props.showresult) {
            return <div />;
        }
        var n_pages = Math.ceil(this.props.count / PAGE_SIZE);
        return (
            <Row>
                <Col md={6}>
                    <p className="count-text">{this.props.count} contacts</p>
                </Col>
                <Col md={6} className="text-right">
                    <Pagination
                        prev
                        next
                        first
                        last
                        ellipsis
                        maxButtons={10}
                        items={n_pages}
                        activePage={this.props.page}
                        onSelect={this.handlePageChange} />
                </Col>
            </Row>
        );
    }
});

var LoadForm = React.createClass({
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
            return <option value={val}>{val}</option>;
        });
        var r = this.props.roles;
        if ($.inArray("all", r) < 0) {
            r.unshift("all");
        }
        var roles = r.map(function (val) {
            return <option value={val}>{val}</option>;
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
                <Col md={10} mdOffset={1}>
                    <h2 className="text-center">Contact Browser</h2>
                    <form className="form-horizontal" onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="component" className="col-sm-4 control-label">Component:</label>
                            <div className="col-sm-4">
                                <input type="text" className="form-control" id="component" ref="component" onChange={this.handleInputChange}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="release" className="col-sm-4 control-label">Release:</label>
                            <Col sm={4} >
                                <select className="form-control" id="release" ref="release" required="required" onChange={this.handleInputChange}>
                                   {releases}
                                </select>
                            </Col>
                            <Spinner_loader enabled={release_spinning} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role" className="col-sm-4 control-label">Contact Role:</label>
                            <Col sm={4} >
                                <select className="form-control" id="role" ref="role" required="required" onChange={this.handleInputChange} >
                                   {roles}
                                </select>
                            </Col>
                            <Spinner_loader enabled={role_spinning} />
                        </div>
                        <div className="form-group">
                            <Col sm={8} smOffset={2} className="text-center">
                                <Button type="submit">Search</Button>
                            </Col>
                        </div>
                    </form>
                </Col>
            </Row>
        );
    }
});

var Browser = React.createClass({
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
        }
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
                <div>
                    <Col md={8} mdOffset={2}>
                        <h3 className="text-center"> Results </h3>
                        <BootstrapTable data={contacts} striped={true} hover={true} condensed={true} insertRow={true} deleteRow={true} selectRow={selectRowProp} options={options}>
                            <TableHeaderColumn dataField="url" isKey={true} autoValue={true} hidden={true}>Url</TableHeaderColumn>
                            <TableHeaderColumn dataField="component" dataAlign="center" width="80">Component</TableHeaderColumn>
                            <TableHeaderColumn dataField="release" dataAlign="center" editable={release_editable} width="60">Release</TableHeaderColumn>
                            <TableHeaderColumn dataField="contact" dataAlign="center" editable={contact_editable} width="180">Contact</TableHeaderColumn>
                            <TableHeaderColumn dataField="role" dataAlign="center" editable={role_editable} width="60">Contact Role</TableHeaderColumn>
                        </BootstrapTable>
                    </Col>
                </div>
        );
    }
});

React.render(
    <Router history={createHistory({ queryKey: false })}>
        <Route path="/" component={ ContactBrowserApp } />
        <Route path="/release-component-contacts/" component={ ContactBrowserApp } />
        <Route path="/global-component-contacts/" component={ ContactBrowserApp } />
    </Router>,
    document.getElementById('app')
);
