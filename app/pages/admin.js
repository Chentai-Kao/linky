import React from 'react';
import Header from '../components/Header';
import HtmlHead from '../components/HtmlHead';
import Members from '../components/Members';
import MemberRequests from '../components/MemberRequests';
import Container from '../components/Container';
import AdminConfigForm from '../components/AdminConfigForm';
import { apiGetJson } from '../lib/apiHelper';
import GlobalStyle from '../components/GlobalStyle';

class Admin extends React.Component {
  static async getInitialProps() {
    return {};
  }

  constructor(props) {
    super(props);

    this.reloadUsers = this.reloadUsers.bind(this);

    this.reloadUsers();

    this.state = {
      users: [],
    };
  }

  async reloadUsers() {
    const { users } = await apiGetJson('/users');
    if (users) {
      this.setState({ users });
    }
  }

  render() {
    const { users } = this.state;
    const memberRequests = users.filter(u => u.status === 'new');
    const members = users.filter(
      u => u.status === 'member' || u.status === 'admin',
    );

    return (
      <>
        <HtmlHead />
        <Header isAuthed={true} />
        <GlobalStyle />

        <Container>
          <section className="mt-5">
            <h4 className="text-muted">Configuration</h4>
            <hr></hr>
            <AdminConfigForm />
          </section>

          <section className="mt-5 pt-5">
            <h4 className="text-muted">Member Requests</h4>
            <hr></hr>
            <MemberRequests
              memberRequests={memberRequests}
              reloadUsers={this.reloadUsers}
            />
          </section>

          <section className="mt-5 pt-5">
            <h4 className="text-muted">Members</h4>
            <hr></hr>
            <Members members={members} reloadUsers={this.reloadUsers} />
          </section>
        </Container>
      </>
    );
  }
}

export default Admin;
