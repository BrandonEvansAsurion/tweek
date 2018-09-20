import React from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import logoSrc from './resources/logo.png';
import '../styles/core/fonts/fonts.css';
import './App.css';

const ListItemLink = ({ to, ...rest }) => (
  <Route
    path={to}
    children={({ match }) => (
      <li>
        <Link
          className={classNames('menu-item', {
            'selected-location-path': match,
          })}
          to={to}
          {...rest}
        />
      </li>
    )}
  />
);

const AppHeader = () => (
  <div className={'header'}>
    <Link to="/" replace>
      <img className={'logo'} src={logoSrc} alt={''} />
    </Link>
    <ul className={'menu'}>
      <ListItemLink to="/keys">
        <img src={require('./resources/keys.svg')} alt={''} />
        <span>Keys</span>
      </ListItemLink>
      <ListItemLink to="/context">
        <img src={require('./resources/context.svg')} alt={''} />
        <span>Context</span>
      </ListItemLink>
      <ListItemLink to="/settings">
        <img src={require('./resources/settings.svg')} alt={''} />
        <span>Settings</span>
      </ListItemLink>
    </ul>
  </div>
);

export default AppHeader;
