'use strict';

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Pagination = ReactBootstrap.Pagination;

module.exports = React.createClass({
  handlePageChange: function (eventKey) {
    this.props.onPageChange(eventKey);
  },
  render: function () {
    if (this.props.count == 0 || !this.props.showresult) {
        return <div />;
    }
    var n_pages = Math.ceil(this.props.count / this.props.page_size);
    return (
      <Row>
        <Col md={3}>
          <p className="count-text">{this.props.count} contacts</p>
        </Col>
        <Col md={9}>
          <Pagination
            bsClass="pagination pull-right"
            prev
            next
            first
            last
            ellipsis
            maxButtons={5}
            items={n_pages}
            activePage={this.props.page}
            onSelect={this.handlePageChange} />
        </Col>
      </Row>
    );
  }
});
