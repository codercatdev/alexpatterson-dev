import type { NextPage } from 'next';
import Image from 'next/image';
import { NextSeo } from 'next-seo';

const Home: NextPage = () => {
  return (
    <>
      <NextSeo
        title="Simple Usage Example"
        description="A short description goes here."
      />
      Hello World
    </>
  );
};

export default Home;
