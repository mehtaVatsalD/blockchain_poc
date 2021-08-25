import './App.css';
import {
  Router,
  Switch,
  Route
} from "react-router-dom";
import history from './history';
import Home from './components/Home';
import NotFound from './components/NotFound';
import { Container, Menu } from 'semantic-ui-react';
import Campaigns from './components/Campaigns';

function App() {

  function navigateToHome(e) {
    e.preventDefault();
    history.push('/');
  }

  return (
    <Router history={history}>
      <Container>

        <Menu secondary>
          <Menu.Item name="Home" onClick={navigateToHome} />
        </Menu>

        <Switch>
          <Route path="/campaigns/:address" 
            render={
              (props)=> <Campaigns {...props} />
            }
          />
          <Route exact path="/">
            <Home />
          </Route>
          <Route component={NotFound}></Route>
        </Switch>

      </Container>
    </Router>
  );
}

export default App;
 