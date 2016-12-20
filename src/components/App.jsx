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
      <div id="app">
        <header className="app-header">
          <h1 className="title">Chicago Wildlife Watch Map Explorer</h1>
        </header>
        <section className="content-section">
          <Map />
        </section>
        <footer  className="app-footer">
          Part of the <a href="https://www.zooniverse.org/projects/zooniverse/chicago-wildlife-watch">Chicago Wildlife Watch</a> and powered by the <a href="https://zooniverse.org">Zooniverse.</a>
        </footer>
      </div>
    );
  }
}
App.propTypes = {
  children: React.PropTypes.object,
};
