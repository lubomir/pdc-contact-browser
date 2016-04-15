var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var useRouterHistory = ReactRouter.useRouterHistory;
var createHashHistory = require('history').createHashHistory;
var appHistory = useRouterHistory(createHashHistory)({ queryKey: false });
var App = require('./app.jsx');

ReactDOM.render(
  <Router history={appHistory}>
    <Route path="/" component={ App } />
    <Route path="/release-component-contacts/" component={ App } />
    <Route path="/global-component-contacts/" component={ App } />
  </Router>,
  document.getElementById('app')
);
