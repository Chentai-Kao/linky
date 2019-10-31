import React from 'react';
import Router from 'next/router';

import HtmlHead from '../components/HtmlHead';
import Header from '../components/Header';
import GlobalStyle from '../components/GlobalStyle';
import { apiGetJson } from '../lib/apiHelper';

class Pending extends React.Component {
  static async getInitialProps() {
    return {};
  }

  constructor(props) {
    super(props);

    this.redirectMember();
  }

  async redirectMember() {
    const { me } = await apiGetJson('/me');
    if (me && (me.status === 'member' || me.status === 'admin')) {
      Router.push('/error', '/');
    }
  }

  render() {
    return (
      <>
        <HtmlHead />
        <Header isAuthed={true} />
        <GlobalStyle />

        <p className="mt-4 text-center">
          Your request for Linky access is being reviewed. Please contact your
          administrator for any question.
        </p>
      </>
    );
  }
}

export default Pending;
