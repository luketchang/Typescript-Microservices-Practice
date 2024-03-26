import 'bootstrap/dist/css/bootstrap.css';

import Header from '../components/header';
import buildClient from '../api/build-client';

const AppComponent = ({ Component, currentUser, pageProps }) => {
    return (
        <div>
            <Header currentUser={currentUser}/>
            <Component {...pageProps}/>
        </div>
    );
}; 

AppComponent.getInitialProps = async appContext => {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');

    let pageProps = {};
    if(appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx);
    }

    return {
        currentUser: data.currentUser,
        pageProps
    }
};

export default AppComponent;