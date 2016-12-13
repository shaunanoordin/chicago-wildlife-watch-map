import React from 'react';
import { Link } from 'react-router';
import Map from './Map.jsx';

export default class App extends React.Component {
  returnSomething(something) {
    // this is only for testing purposes. Check /test/components/App-test.js
    return something;
  }
  render() {

    return (
      <div>
        <header className="site-header">
          <h1 className="title">Chicago Wildlife Watch Map Explorer</h1>
        </header>
        <section className="content-section">
          <Map />
        </section>
      </div>
    );
  }
}
App.propTypes = {
  children: React.PropTypes.object,
};
