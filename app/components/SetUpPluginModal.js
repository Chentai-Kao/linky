import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';

import { apiGetJson } from '../lib/apiHelper';

class SetUpPluginModal extends React.Component {
  constructor(props) {
    super(props);

    this.show = this.show.bind(this);
    this.close = this.close.bind(this);

    this.loadPluginInfo();

    this.state = {
      showModal: false,
      chromePluginUrl: '',
      pluginMagicKey: '',
    };
  }

  show() {
    this.setState({ showModal: true });
  }

  close() {
    this.setState({ showModal: false });
  }

  async loadPluginInfo() {
    const { chromePluginUrl, pluginMagicKey } = await apiGetJson(
      '/plugin-info',
    );
    this.setState({ chromePluginUrl, pluginMagicKey });
  }

  render() {
    const { chromePluginUrl, pluginMagicKey } = this.state;
    const magicKeyStyle = {
      backgroundColor: '#f8f8f8',
    };
    return (
      <>
        <Dropdown.Item onClick={this.show}>Set up plugin</Dropdown.Item>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Set up plugin</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ol>
              <li>
                <p>Copy the following text.</p>
                <p className="p-2 rounded" style={magicKeyStyle}>
                  <code>{pluginMagicKey}</code>
                </p>
              </li>
              <li>
                <p>
                  Download Chrome plugin from{' '}
                  <a
                    href={chromePluginUrl}
                    target="_blank"
                    rel="noopener noreferrer">
                    Chrome Web Store
                  </a>
                  .
                </p>
              </li>
              <li>
                <p>
                  Click on the plugin icon to display a popup, paste the text to
                  the <b>Magic key</b> field and save it.
                </p>
              </li>
              <li>
                <p>
                  You are all set! Now, open a new tab and try the following
                  links. (remember to put <b>a trailing slash</b>)
                </p>
                <ul>
                  <li>
                    <code>linky/</code>
                  </li>
                  <li>
                    <code>nf/</code>
                  </li>
                  <li>
                    <code>
                      sf/<b>{'any-salesforce-ID'}</b>/
                    </code>{' '}
                    (Not working? Did you forget the trailing slash?)
                  </li>
                </ul>
              </li>
            </ol>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="outline-secondary" onClick={this.close}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default SetUpPluginModal;
