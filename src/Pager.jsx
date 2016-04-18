'use strict';

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Pagination = ReactBootstrap.Pagination;
var PAGE_SIZE = 10;

module.exports = React.createClass({
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
