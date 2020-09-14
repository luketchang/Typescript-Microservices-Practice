import buildClient from '../api/build-client';

const Landing = ({ currentUser }) => {
    return currentUser ? (<h1>You are signed in.</h1>) : (<h1>Please sign in.</h1>);
}

Landing.getInitialProps = async (context) => {
    const client = buildClient(context);
    const { data } = await client.get('/api/users/currentuser');
    console.log(data.currentUser);
    return data;
}

export default Landing;