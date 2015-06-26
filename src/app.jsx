var PAGE_SIZE = 20;

var ContactBrowserApp = React.createClass({
    getInitialState: function () {
        return {token: null, count: 0, data: [], url: null, params: {}, page: 1, busy: false};
    },
    loadData: function () {
        this.setState({busy: true});
        var data = JSON.parse(JSON.stringify(this.state.params));
        data['page'] = this.state.page;
        $.ajax({
            url: this.state.url,
            dataType: "json",
            data: data,
            success: function (response) {
                this.setState({busy: false,
                              data: response.results,
                              count: response.count,
                              next: response.next,
                              prev: response.prev});
            }.bind(this),
            error: function (xhr, status, err) {
                this.setState({busy: false});
                console.log(this.props.url, status, err);
            }.bind(this)
        });
    },
    handleFormSubmit: function (data) {
        var url = this.props.url + data['type'] + "/";
        var params = {};
        if (data['email']) {
            params['email'] = data['email'];
        }
        if (data['name']) {
            params['name'] = data['name'];
        }
        if (data['type'] == 'release' && data['release_id']) {
            params['release'] = data['release_id'];
        }
        this.setState({token: data['token'], url: url, params: params, page: 1},
                      this.loadData);
    },
    handlePageChange: function (p) {
        this.setState({page: p}, this.loadData);
    },
    handleDelete: function (url) {
        this.setState({busy: true});
        $.ajax({
            url: url,
            method: "DELETE",
            success: this.loadData,
            failure: function (xhr, status, err) {
                this.setState({busy: false});
                console.log(url, status, err);
            }.bind(this)
        })
    },
    render: function () {
        return (
            <div className="container-fluid">
                <LoadForm onSubmit={this.handleFormSubmit} />
                <Pager count={this.state.count} page={this.state.page} onPageChange={this.handlePageChange} />
                <Browser data={this.state.data} onDelete={this.handleDelete} />
                <Pager count={this.state.count} page={this.state.page} onPageChange={this.handlePageChange} />
                <Spinner enabled={this.state.busy} />
            </div>
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

var Pager = React.createClass({
    handlePageChange: function (p) {
        this.props.onPageChange(p);
    },
    render: function () {
        if (this.props.count == 0) {
            return <div />;
        }
        var n_pages = Math.ceil(this.props.count / PAGE_SIZE);
        var buttons = [];
        for (var p = 1; p <= n_pages; p++) {
            if (this.props.page == p) {
                buttons.push(<li key={p} className="active"><a href="#">{p}</a></li>);
            } else {
                buttons.push(<li key={p}><a href="#" onClick={this.handlePageChange.bind(this, p)}>{p}</a></li>);
            }
        }
        return (
            <div className="row">
                <div className="col-md-6">
                    <p className="count-text">{this.props.count} components</p>
                </div>
                <nav className="col-md-6 text-right">
                    <ul className="pagination">
                        {buttons}
                    </ul>
                </nav>
            </div>
        );
    }
});

var LoadForm = React.createClass({
    getInitialState: function () {
        return {globalComponents: true};
    },
    handleTypeToggle: function (e) {
        React.findDOMNode(this.refs.release_id).value = '';
        this.setState({globalComponents: e.target.id == "global"});
    },
    handleSubmit: function (e) {
        e.preventDefault();
        var data = {
            'token': React.findDOMNode(this.refs.token).value,
            'email': React.findDOMNode(this.refs.email).value,
            'name': React.findDOMNode(this.refs.name).value,
            'type': React.findDOMNode(this.refs.global).checked ? 'global-components' : 'release-components',
            'release_id': React.findDOMNode(this.refs.release_id).value
        };
        if (!data['token']) {
            return;
        }
        this.props.onSubmit(data);
    },
    render: function () {
        var disabled = this.state.globalComponents ? "disabled" : "";
        return (
            <div className="row loadForm">
                <div className="col-md-8 col-md-offset-2">
                    <form className="form-horizontal" onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="token" className="col-sm-2 control-label">Token*</label>
                            <div className="col-sm-10">
                                <input type="text" className="form-control" id="token" ref="token" required="required" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="col-sm-2 control-label">E-mail</label>
                            <div className="col-sm-10">
                                <input type="email" className="form-control" id="email" ref="email" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="name" className="col-sm-2 control-label">Component Name</label>
                            <div className="col-sm-10">
                                <input type="text" className="form-control" id="name" ref="name" />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-sm-offset-2 col-sm-10">
                                <label className="radio-inline">
                                    <input type="radio" name="type" id="global" ref="global"
                                        defaultChecked="true" onChange={this.handleTypeToggle} />
                                    Global Components
                                </label>
                                <label className="radio-inline">
                                    <input type="radio" name="type" id="release"
                                        onChange={this.handleTypeToggle} />
                                    Release Components
                                </label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="release_id" className="col-sm-2 control-label">Release</label>
                            <div className="col-sm-10">
                                <input type="text" className="form-control" id="release_id" ref="release_id"
                                    aria-describedby="helpBlock"
                                    disabled={disabled} />
                                <span id="helpBlock" className="help-block">
                                    Only display components from this release. If left empty, all releases
                                    will be processed.
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-sm-offset-2 col-sm-10">
                                <button type="submit" className="btn btn-default">Load components</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});

var Browser = React.createClass({
    handleDelete: function (url) {
        this.props.onDelete(url);
    },
    render: function () {
        var components = this.props.data.map(function (c) {
            return <ComponentView key={c.url} data={c} onDelete={this.handleDelete} foo="bar" />;
        }.bind(this));
        return (
            <div>
                {components}
            </div>
        );
    }
});

var ComponentView = React.createClass({
    handleDelete: function (url) {
        this.props.onDelete(url);
    },
    render: function () {
        var contacts = this.props.data.contacts.map(function (c) {
            return (<ContactView key={c.url} data={c} onDelete={this.handleDelete} />);
        }.bind(this));
        var name = this.props.data.name;
        if ("release" in this.props.data) {
            name = this.props.data.release.release_id + "/" + this.props.data.name;
        }
        return (
            <div>
                <h2>
                    {name}
                    <button type="button" className="btn btn-default">
                        <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span> Create
                    </button>
                </h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>E-mail</th>
                            <th>Role</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts}
                    </tbody>
                </table>
            </div>
        );
    }
});

var ContactView = React.createClass({
    handleDelete: function (e) {
        e.preventDefault();
        this.props.onDelete(this.props.data.url);
    },
    render: function () {
        var inherited = <span />
        if ("inherited" in this.props.data && this.props.data.inherited) {
            inherited = <span className="glyphicon glyphicon-link" title="Inherited from global component" />;
        }
        var name = "username" in this.props.data.contact
            ? this.props.data.contact.username
            : this.props.data.contact.mail_name;
        return (
            <tr>
                <td><p className="form-control-static text-center">{inherited}</p></td>
                <td><p className="form-control-static">{name}</p></td>
                <td><p className="form-control-static">{this.props.data.contact.email}</p></td>
                <td><p className="form-control-static">{this.props.data.contact_role}</p></td>
                <td>
                    <div className="btn-group">
                        <button type="button" className="btn btn-default" title="Edit">
                            <span className="glyphicon glyphicon-edit" aria-hidden="true"></span>
                        </button>
                        <button type="button" className="btn btn-default" title="Delete"
                            onClick={this.handleDelete}>
                            <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                        </button>
                    </div>
                </td>
            </tr>
        );
    }
});

React.render(
    <ContactBrowserApp url="http://localhost:8000/rest_api/v1/" />,
    document.getElementById('app')
);
