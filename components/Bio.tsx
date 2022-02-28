import { useState } from 'react';

const Bio = () => {
  const [active, setActive] = useState(0);

  return (
    <div className="flex-grow-0 w-full tabs">
      <a
        className={`tab tab-lifted tab-border-none tab-lg flex-1 ${
          active == 0 ? 'tab-active' : ''
        }`}
        onClick={() => setActive(0)}
      >
        Short
      </a>
      <a
        className={`tab tab-lifted tab-border-none tab-lg flex-1 ${
          active == 1 ? 'tab-active' : ''
        }`}
        onClick={() => setActive(1)}
      >
        Speaker
      </a>
      <a
        className={`tab tab-lifted tab-border-none tab-lg flex-1 ${
          active == 2 ? 'tab-active' : ''
        }`}
        onClick={() => setActive(2)}
      >
        Long
      </a>
      {active == 0 && (
        <div className="grid flex-grow w-full gap-3 p-6 rounded-tl-none bg-base-100 rounded-xl">
          I’m the founder of CodingCatDev, where we create “Purrfect Web
          Tutorials” to teach the world how to turn their development dreams
          into reality. I am a professional full stack developer, and I am
          passionate about mentoring new developers and helping the community
          that has allowed me to live my development dreams. I firmly believe
          that anyone can learn to be a developer. The CodingCatDev team is here
          to help!
        </div>
      )}
      {active == 1 && (
        <div className="grid flex-grow w-full gap-3 p-6 bg-base-100 rounded-xl">
          Alex is the founder of CodingCatDev, where they create “Purrfect Web
          Tutorials” to teach the world how to turn their development dreams
          into reality. Alex is a professional full stack developer, and he is
          passionate about mentoring new developers and helping the community
          that has allowed him to live his development dreams. Alex firmly
          believes that anyone can learn to be a developer. The CodingCatDev
          team is here to help!
        </div>
      )}
      {active == 2 && (
        <div className="grid flex-grow w-full gap-3 p-6 rounded-tr-none bg-base-100 rounded-xl">
          <p>
            I’m the founder of CodingCatDev, where we create “Purrfect Web
            Tutorials” to teach the world how to turn their development dreams
            into reality. I am a professional full stack developer, and I am
            passionate about mentoring new developers and helping the community
            that has allowed me to live my development dreams. I firmly believe
            that anyone can learn to be a developer. The CodingCatDev team is
            here to help!
          </p>
          <p>
            In college I first learned to develop on the Web using PHP, HTML,
            JavaScript and CSS. Like many I used the (WLM)AMP stack when I first
            started and moved towards Wordpress and Drupal.
          </p>
          <p>
            I started my career as a SAP ABAPer with 0 experience. SAP is a huge
            ERP system that has several programs that are written at its core,
            as well as customizations that are created for companies. While I
            enjoyed the language I always wanted to write Web applications and
            took every opportunity to create them. I was able to create a
            Manufacturing Execution System for a very large Office Furniture
            Manufacturer.
          </p>
          <p></p>
        </div>
      )}
    </div>
  );
};

export default Bio;
