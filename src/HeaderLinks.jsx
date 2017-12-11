'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var Dropdown = ReactBootstrap.Dropdown;
var MenuItem = ReactBootstrap.MenuItem;

var common = require('./common.jsx');

module.exports = React.createClass({
    render: function () {
        if (!this.props.links) {
            return null;
        }

        var links = this.props.links.map(function (item) {
            return (<MenuItem key={item[0]} href={item[0]}>{item[1]}</MenuItem>);
        });

        return (
            <ul className="nav navbar-nav navbar-utility">
                <Dropdown componentClass="li" id="header-links">
                    <Dropdown.Toggle useAnchor>
                        <span className="fa fa-star"></span>
                        Links
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {links}
                    </Dropdown.Menu>
                </Dropdown>
            </ul>
        );
    }
});
