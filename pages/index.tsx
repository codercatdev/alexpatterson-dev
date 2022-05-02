import type { NextPage } from 'next';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import Tabs from '../components/Bio';
import Links from '../components/Links';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader

const ThemeChanger = dynamic(() => import('../components/ThemeChanger'));

export async function getStaticProps() {
  return {
    props: {},
  };
}

const Home: NextPage = () => {
  const [animate, setAnimate] = useState(true);
  useEffect(() => {}, []);

  const reanimate = () => {
    setAnimate(false);
    setTimeout(() => {
      setAnimate(true);
    }, 1);
  };

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
              url: `https://media.codingcat.dev/image/upload/c_fit,w_1200,h_630/main-codingcatdev-photo/headshots/alex_soundproof.jpge`,
              width: 1200,
              height: 630,
              alt: 'Alex patterson',
            },
            {
              url: `https://media.codingcat.dev/image/upload/main-codingcatdev-photo/headshots/alex_soundproof.jpg`,
              alt: 'Alex patterson',
            },
          ],
        }}
        twitter={{
          handle: '@codercatdev',
          site: '@codercatdev',
          cardType: 'summary_large_image',
        }}
      ></NextSeo>
      <div className="relative flex flex-col items-center justify-center min-h-screen from-primary to-secondary bg-gradient-to-br">
        <div className="absolute top-0 z-30 flex justify-end w-full">
          <ThemeChanger reanimate={reanimate} />
        </div>
        <div className="">
          <div
            className={`flex-col max-w-lg p-2 m-4 rounded-lg bg-base-200 ${
              animate ? 'md:animate-fade-in-down' : ''
            }`}
          >
            <div className="flex flex-col items-center mb-4 md:gap-2 md:flex-row">
              <div className="max-w-xs">
                <Carousel showStatus={false} autoFocus={true}>
                  <a href="https://media.codingcat.dev/image/upload/fl_attachment:alex_patterson_headshot_3/main-codingcatdev-photo/headshots/alex_soundproof.jpg">
                    <Image
                      src="/main-codingcatdev-photo/headshots/alex_soundproof.jpg"
                      alt="Headshot of Alex Patterson with glasses and stickers"
                      height={320}
                      width={320}
                      priority={true}
                      className="rounded-xl"
                    />
                  </a>

                  <a href="https://media.codingcat.dev/image/upload/fl_attachment:alex_patterson_headshot_1/main-codingcatdev-photo/headshots/alex_headshot_1.jpg">
                    <Image
                      src="/main-codingcatdev-photo/headshots/alex_headshot_1.jpg"
                      alt="Headshot of Alex Patterson Professional"
                      height={320}
                      width={320}
                      priority={true}
                      className="rounded-xl"
                    />
                  </a>

                  <a href="https://media.codingcat.dev/image/upload/fl_attachment:alex_patterson_headshot_2/main-codingcatdev-photo/headshots/alex_fire.jpg">
                    <Image
                      src="/main-codingcatdev-photo/headshots/alex_fire.jpg"
                      alt="Headshot of Alex Patterson Vacation with Fire Background"
                      height={320}
                      width={320}
                      priority={true}
                      className="rounded-xl"
                    />
                  </a>

                  <a href="https://media.codingcat.dev/image/upload/fl_attachment:alex_patterson_headshot_4/main-codingcatdev-photo/headshots/alex_casual.jpg">
                    <Image
                      src="/main-codingcatdev-photo/headshots/alex_casual.jpg"
                      alt="Headshot of Alex Patterson casual in Europe"
                      height={320}
                      width={320}
                      priority={true}
                      className="rounded-xl"
                    />
                  </a>
                </Carousel>
              </div>

              <div className="flex flex-col">
                <h2 className="text-xl card-title md:text-3xl">
                  Alex Patterson
                </h2>
                <p className="text-md md:text-lg">Developer Advocate</p>
                <p>
                  <a
                    className="gap-2 btn"
                    href="https://builder.io/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <svg
                      width={103}
                      height={120}
                      viewBox="0 0 103 120"
                      className="w-6 h-6"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_911_286)">
                        <path
                          d="M2.13117 109.797L1.64331 110.296C0.853534 111.097 0.318012 112.112 0.104114 113.216C-0.109783 114.32 0.00749937 115.462 0.441202 116.499C0.874906 117.536 1.60566 118.422 2.54153 119.045C3.47741 119.668 4.5766 120 5.70082 120H69.2705C101.469 120 114.718 78.8181 88.7906 60L88.4634 60.238L2.13117 109.803"
                          fill="currentColor"
                          className="opacity-50"
                        />
                        <path
                          d="M2.13117 10.1973L88.4634 59.762L88.7906 60C114.718 41.182 101.469 1.39535e-07 69.2705 1.39535e-07H5.70082C4.5766 -0.000248566 3.47741 0.331977 2.54153 0.95489C1.60566 1.5778 0.874906 2.46359 0.441202 3.50079C0.00749937 4.53799 -0.109783 5.68028 0.104114 6.78396C0.318012 7.88765 0.853534 8.90343 1.64331 9.70352L2.13117 10.2033"
                          fill="currentColor"
                          className="opacity-50"
                        />
                        <path
                          d="M2.13116 109.803L88.4633 60.2379L88.7906 59.9999L88.4633 59.762L2.13116 10.1973C15.2148 23.4717 22.5493 41.3615 22.5493 59.9999C22.5493 78.6384 15.2148 96.5282 2.13116 109.803Z"
                          fill="currentColor"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_911_286">
                          <rect width="102.507" height={120} fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    Builder.io
                  </a>
                </p>
              </div>
            </div>
            <Links />
            <Tabs />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
