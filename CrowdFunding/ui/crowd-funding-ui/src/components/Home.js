import {useState} from 'react';

import { Button, Form, Header } from "semantic-ui-react";
import history from '../history';

function Home() {

    const [address, setAddress] = useState();

    const onSubmit = (e) => {
        e.preventDefault();
        history.push(`/campaigns/${address}`);
    }

    const setAddressValue = (e) => {
        e.preventDefault();
        setAddress(e.target.value);
    }

    return (
        <div>
            <Header as='h1'>Decentralized crowdfunding application</Header>

            <Form>
                <Form.Input
                    label="Contract Address"
                    type="text"
                    value={address}
                    onChange={setAddressValue}
                />
                <Button
                type="submit"
                onClick={onSubmit}
                >
                    Submit
                </Button>
            </Form>
        </div>
    );

}

export default Home;