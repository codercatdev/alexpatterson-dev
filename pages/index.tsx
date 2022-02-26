import type { NextPage } from 'next';
import Image from 'next/image';
import { NextSeo } from 'next-seo';

const Home: NextPage = () => {
  return (
    <>
      <NextSeo
        title="Alex Patterson"
        description="Developer Advocate"
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `https://alexpatterson.dev`,
          title: 'Alex Patterson',
          description: 'Developer Advocate',
          site_name: 'Alex Patterson',
          images: [
            {
              url: `https://media.codingcat.dev/image/upload/c_fit,w_1200,h_630/authors/alex_headshot`,
              width: 1200,
              height: 630,
              alt: 'Alex patterson',
            },
            {
              url: `https://media.codingcat.dev/image/upload/authors/alex_headshot`,
              alt: 'Alex patterson',
            },
          ],
        }}
      ></NextSeo>
      Hello World
    </>
  );
};

export default Home;
