import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';

import Header from '../components/Header';
import HtmlHead from '../components/HtmlHead';
import Links from '../components/Links';
import GlobalStyle from '../components/GlobalStyle';
import CreateLinkForm from '../components/CreateLinkForm';
import Container from '../components/Container';
import { apiGetJson } from '../lib/apiHelper';

class Index extends React.Component {
  static async getInitialProps() {
    return {};
  }

  constructor(props) {
    super(props);

    this.reloadLinks = this.reloadLinks.bind(this);

    this.reloadLinks();

    this.state = {
      links: [],
    };
  }

  async reloadLinks() {
    const { links } = await apiGetJson('/links');
    if (links) {
      this.setState({ links });
    }
  }

  render() {
    const { router } = this.props;
    const hintStyle = {
      backgroundColor: '#8d8',
    };
    const hintDoneStyle = {
      position: 'absolute',
      right: 0,
    };
    const isOnboarding = router.query.onboarding;
    const onboardingHint = isOnboarding && (
      <div
        className="text-center position-relative py-2 text-white"
        style={hintStyle}>
        <span>
          first timer? click the top-right menu button and <b>set up plugin</b>
        </span>

        <a href="/" className="text-white mr-3" style={hintDoneStyle}>
          <b>Done</b>
        </a>
      </div>
    );
    const linksComponent =
      this.state.links.length > 0 ? (
        <Links links={this.state.links} reloadLinks={this.reloadLinks} />
      ) : (
        <p className="text-secondary text-center">(no links)</p>
      );

    return (
      <>
        <HtmlHead />
        <Header isAuthed={true} />
        <GlobalStyle />

        {onboardingHint}

        <Container>
          <section className="mt-5">
            <CreateLinkForm reloadLinks={this.reloadLinks} />
          </section>

          <section className="mt-5 pt-5">
            <h4 className="text-muted">Links</h4>
            <hr></hr>
            {linksComponent}
          </section>
        </Container>
      </>
    );
  }
}

Index.propTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(Index);
