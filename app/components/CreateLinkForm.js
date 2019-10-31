import React from 'react';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Col from 'react-bootstrap/Col';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';

import ConfirmToast from './ConfirmToast';
import { apiPost } from '../lib/apiHelper';

class CreateLinkForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const rawTarget = form.elements.target.value.trim();
    const target = /https?:\/\//.test(rawTarget)
      ? rawTarget
      : `http://${rawTarget}`;
    const alias = form.elements.alias.value.trim();
    if (alias && target) {
      const response = await apiPost('/links', { alias, target });
      if (response.ok) {
        form.reset();
        ConfirmToast.success(`Alias "${alias}" is created.`);
      } else {
        const { error } = await response.json();
        ConfirmToast.error(error);
      }
    }
    await this.props.reloadLinks();
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit} className="mx-2">
        <Form.Group as={Form.Row}>
          <Form.Label column sm={2}>
            Alias
          </Form.Label>
          <Col sm={10}>
            <FormControl
              type="text"
              name="alias"
              placeholder="nf"
              pattern="[^{}./]+"
              required
            />
            <Form.Text className="text-muted">
              Do not use curly braces {'{}'}, slash /, or dot .
            </Form.Text>
          </Col>
        </Form.Group>

        <Form.Group as={Form.Row}>
          <Form.Label column sm={2}>
            Full URL
          </Form.Label>
          <Col sm={10}>
            <FormControl
              type="text"
              name="target"
              placeholder="http://newfrontinsurance.com"
              required
            />
            <Form.Text className="text-muted">
              Pro tip: insert tokens {'{0}, {1}, ...'} to create dynamic alias,
              like {'https://en.wikipedia.org/wiki/{0}#{1}'}
            </Form.Text>
          </Col>
        </Form.Group>

        <div className="text-center">
          <Button type="submit" variant="outline-primary" block={false}>
            Create
          </Button>
        </div>
      </Form>
    );
  }
}

CreateLinkForm.propTypes = {
  reloadLinks: PropTypes.func.isRequired,
};

export default CreateLinkForm;
