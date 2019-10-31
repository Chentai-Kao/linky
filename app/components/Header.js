import React from 'react';
import PropTypes from 'prop-types';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import Menu from '@material-ui/icons/Menu';
import Router from 'next/router';
import styled from 'styled-components';

import { apiGetJson, apiPost } from '../lib/apiHelper';
import HoverTooltip from '../components/HoverTooltip';
import SetUpPluginModal from './SetUpPluginModal';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.logOut = this.logOut.bind(this);

    if (props.isAuthed) {
      this.reloadMe();
    }

    this.state = {
      me: null,
    };
  }

  async reloadMe() {
    const { me } = await apiGetJson('/me');
    if (me) {
      this.setState({ me });
    }
  }

  async logOut() {
    await apiPost('/logout');
    Router.replace('/login');
  }

  render() {
    const { me } = this.state;
    const dropdownStyle = {
      position: 'absolute',
      right: 0,
    };
    const StyledDropdownToggle = styled(Dropdown.Toggle)`
      :after {
        content: none;
      }
    `;
    const menu = this.state.me && (
      <Dropdown navbar={true} className="mr-1" style={dropdownStyle}>
        <HoverTooltip direction="left" text="menu">
          <StyledDropdownToggle variant="dark">
            <Menu />
          </StyledDropdownToggle>
        </HoverTooltip>

        <Dropdown.Menu alignRight={true}>
          <Dropdown.Item disabled>{me.email}</Dropdown.Item>

          {me.status === 'admin' && (
            <Dropdown.Item href="/admin">Admin</Dropdown.Item>
          )}

          {(me.status === 'member' || me.status === 'admin') && (
            <SetUpPluginModal />
          )}

          <Dropdown.Item onClick={this.logOut}>Log out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    return (
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="/" className="mx-auto">
          <h1 className="h4 mb-0">Linky</h1>
        </Navbar.Brand>

        {menu}
      </Navbar>
    );
  }
}

Header.propTypes = {
  isAuthed: PropTypes.bool.isRequired,
};

export default Header;
