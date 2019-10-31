import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import HoverTooltip from '../components/HoverTooltip';
import { apiGetJson, apiDelete } from '../lib/apiHelper';
import ConfirmToast from '../components/ConfirmToast';

const EMAIL_LDAP_REGEX_PATTERN = /^([^@]+)@.+$/;

class Links extends React.Component {
  constructor(props) {
    super(props);

    this.removeAlias = this.removeAlias.bind(this);
    this.reloadMe();

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

  async removeAlias(alias) {
    const data = { alias };
    await apiDelete('/links', data);
    ConfirmToast.success(`Alias "${alias}" is deleted.`);
    this.props.reloadLinks();
  }

  getMaxWidthStyle(width) {
    return {
      display: 'inline-block',
      overflowX: 'auto',
      maxWidth: width,
    };
  }

  render() {
    if (!this.props.links.length === 0) {
      return <p className="text-secondary text-center">(no links)</p>;
    }

    const postfixStyle = {
      color: '#aaa',
    };
    const deleteButtonStyle = {
      position: 'absolute',
      right: 0,
    };
    const sortedLinks = _.sortBy(this.props.links, l => -l.count);
    const rows = sortedLinks.map((link, index) => {
      const aliasHref = `http://${link.alias}/`;
      const tokens = link.target.match(/\{[^}]+\}/g);
      const maxToken = tokens
        ? Math.max(...tokens.map(t => parseInt(t.slice(1, -1)))) + 1
        : 0;
      const tokenLabels = _.range(maxToken).map(t => `{${t}}`);
      const postfix = tokens ? `/${tokenLabels.join('/')}/` : '/';
      const isMyLink = this.state.me && this.state.me.id === link.creator.id;
      const ldap = link.creator.email.match(EMAIL_LDAP_REGEX_PATTERN)[1];
      const deleteButton = isMyLink && (
        <ConfirmDeleteModal
          title="Confirm deletion"
          description={`Are you sure you want to delete alias "${link.alias}"?`}
          confirm={() => this.removeAlias(link.alias)}></ConfirmDeleteModal>
      );
      return (
        <div key={index} className="row py-2">
          <p className="col-2 text-break d-flex align-items-center">
            <a href={aliasHref} target="_blank" rel="noopener noreferrer">
              {link.alias}
              <span style={postfixStyle}>{postfix}</span>
            </a>
          </p>

          <p className="col-6 text-break d-flex align-items-center">
            <span>{link.target}</span>
          </p>

          <p className="col-1 text-break d-flex align-items-center">
            <span>{link.count}</span>
          </p>

          <p className="col-3 d-flex align-items-center">
            <HoverTooltip direction="top" text={link.creator.email}>
              <span className="text-muted text-break">{ldap}</span>
            </HoverTooltip>

            <span style={deleteButtonStyle}>{deleteButton}</span>
          </p>
        </div>
      );
    });

    return (
      <div className="container">
        <div className="row">
          <p className="col-2 text-secondary font-weight-bold text-break">
            Alias
          </p>
          <p className="col-6 text-secondary font-weight-bold text-break">
            Link
          </p>
          <p className="col-1 text-secondary font-weight-bold text-break">
            Usage
          </p>
          <p className="col-3 text-secondary font-weight-bold text-break">
            Creator
          </p>
        </div>

        {rows}
      </div>
    );
  }
}

Links.propTypes = {
  links: PropTypes.array.isRequired,
  reloadLinks: PropTypes.func.isRequired,
};

export default Links;
