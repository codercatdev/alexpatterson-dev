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
              url: `https://media.codingcat.dev/image/upload/c_fit,w_1200,h_630/main-codingcatdev-photo/authors/alex_headshot`,
              width: 1200,
              height: 630,
              alt: 'Alex patterson',
            },
            {
              url: `https://media.codingcat.dev/image/upload/main-codingcatdev-photo/authors/alex_headshot`,
              alt: 'Alex patterson',
            },
          ],
        }}
      ></NextSeo>
      <div className="flex items-center justify-center w-screen h-screen">
        <div>
          <div className="card w-96 bg-primary text-primary-content">
            <div className="card-body">
              <h2 className="card-title">Alex Patterson</h2>
              <div className="avatar">
                <div className="w-full">
                  <Image
                    src="/main-codingcatdev-photo/authors/alex_headshot"
                    alt="Headshot of Alex Patterson"
                    layout="fill"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
