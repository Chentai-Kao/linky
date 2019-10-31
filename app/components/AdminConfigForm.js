import React from 'react';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import ConfirmToast from './ConfirmToast';
import { apiGetJson, apiPut } from '../lib/apiHelper';

class AdminConfigForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);

    this.reloadConfigs();

    this.state = {
      emailDomain: '',
    };
  }

  async reloadConfigs() {
    const { configs } = await apiGetJson('/configs');
    if (configs) {
      const { emailDomain } = configs;
      this.setState({ emailDomain });
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const { email } = form.elements;
    const emailDomain = email.value.trim();
    if (emailDomain) {
      const response = await apiPut('/configs', { emailDomain });
      if (response.ok) {
        ConfirmToast.success('Config is saved.');
      } else {
        ConfirmToast.error('Error when saving config');
      }
    }
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit} className="m-4">
        <Form.Group as={Form.Row}>
          <Form.Label column sm={3}>
            Member email whitelist{' '}
            <span className="text-muted">(optional)</span>
          </Form.Label>
          <Col sm={9}>
            <FormControl
              type="text"
              name="email"
              defaultValue={this.state.emailDomain}
              placeholder="@newfrontinsurance.com"
              pattern="@.+\..+"
              required
            />
            <Form.Text className="text-muted">
              Member request from this email domain will be auto-approved. Value
              must start with @.
            </Form.Text>
          </Col>
        </Form.Group>

        <div className="text-center">
          <Button type="submit" variant="outline-primary" block={false}>
            Save
          </Button>
        </div>
      </Form>
    );
  }
}

export default AdminConfigForm;
