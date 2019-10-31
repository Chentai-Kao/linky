import React from 'react';
import Button from 'react-bootstrap/Button';

import HtmlHead from '../components/HtmlHead';
import Header from '../components/Header';
import GlobalStyle from '../components/GlobalStyle';

class Login extends React.Component {
  static async getInitialProps() {
    return {};
  }

  render() {
    return (
      <>
        <HtmlHead />
        <Header isAuthed={false} />
        <GlobalStyle />

        <div className="mt-4 text-center">
          <Button href="/auth-start" variant="outline-primary" block={false}>
            Log in
          </Button>
        </div>
      </>
    );
  }
}

export default Login;
