import '../styles/index.css';
import Layout from '../components/layouts/Layout';

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
  );
}

export default MyApp;
