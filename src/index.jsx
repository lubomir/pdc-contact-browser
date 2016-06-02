require('patternfly/dist/css/patternfly.css');
require('react-bootstrap-table/css/react-bootstrap-table.css');
require('react-select/dist/react-select.css');
require('./../css/spinner.css');
require('./../css/modal.css');
require('./../css/app.css');

var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var useRouterHistory = ReactRouter.useRouterHistory;
var createHashHistory = require('history').createHashHistory;
var appHistory = useRouterHistory(createHashHistory)({ queryKey: false });
var App = require('./app.jsx');
var $ = require('jquery');

var performSearch = function(nextState) {
  if (nextState.location.action === 'POP') {
    $('.wrapper').trigger('historyChange', [ nextState.location ]);
  }
};
var returntoInitState = function() {
  $('.wrapper').trigger('historyChange', [{ 'query': { 'page': 0 }}]);
};
var routeChange = function(prevState, nextState) {
  if ((prevState.location.action === 'PUSH' && nextState.location.action === 'POP')
    || (prevState.location.search !== nextState.location.search) && nextState.location.action === 'POP') {
      $('.wrapper').trigger('historyChange', [ nextState.location ]);
  }
};

ReactDOM.render(
  <Router history={appHistory}>
    <Route path="/" component={ App } />
    <Route path="/release-component-contacts/" component={ App } onChange={routeChange} onEnter={performSearch} onLeave={returntoInitState}/>
    <Route path="/global-component-contacts/" component={ App } onChange={routeChange} onEnter={performSearch} onLeave={returntoInitState}/>
  </Router>,
  document.getElementById('app')
);
