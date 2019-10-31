import React from 'react';
import Head from 'next/head';

class HtmlHead extends React.Component {
  render() {
    return (
      <Head>
        <title>Linky</title>
        <link
          rel="shortcut icon"
          type="image/x-icon"
          href="static/favicon.ico"
        />
        // CSS for FontAwesome (avoid race condition)
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.9.0/css/svg-with-js.css"
        />
        // CSS for ReactBootstrap
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />
      </Head>
    );
  }
}

export default HtmlHead;
