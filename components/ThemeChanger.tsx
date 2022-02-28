import { useEffect } from 'react';
import { themeChange } from 'theme-change';

const ThemeChanger = () => {
  useEffect(() => {
    themeChange(false);
  }, []);
  return (
    <div title="Change Theme" className="dropdown dropdown-end ">
      <div tabIndex={0} className="gap-2 normal-case btn btn-ghost">
        <svg
          width={20}
          height={20}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block w-5 h-5 stroke-current md:h-6 md:w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>{' '}
        <span className="hidden md:inline">Change Theme</span>{' '}
        <svg
          width={20}
          height={20}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1792 1792"
          className="inline-block w-4 h-4 ml-1 fill-current"
        >
          <path d="M1395 736q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z" />
        </svg>
      </div>
      <div className="mt-16 overflow-y-auto shadow-2xl bg-base-100 dropdown-content text-base-content rounded-t-box rounded-b-box top-px h-96 w-52">
        <ul className="p-4 menu menu-compact" tabIndex={0}>
          <li>
            <button data-set-theme="light" data-act-class="active" className="">
              🌝  light
            </button>
          </li>
          <li>
            <button
              data-set-theme="dark"
              data-act-class="active"
              className="active"
            >
              🌚  dark
            </button>
          </li>
          <li>
            <button
              data-set-theme="cupcake"
              data-act-class="active"
              className=""
            >
              🧁  cupcake
            </button>
          </li>
          <li>
            <button
              data-set-theme="bumblebee"
              data-act-class="active"
              className=""
            >
              🐝  bumblebee
            </button>
          </li>
          <li>
            <button
              data-set-theme="emerald"
              data-act-class="active"
              className=""
            >
              ✳️  Emerald
            </button>
          </li>
          <li>
            <button
              data-set-theme="corporate"
              data-act-class="active"
              className=""
            >
              🏢  Corporate
            </button>
          </li>
          <li>
            <button data-set-theme="synthwave" data-act-class="active">
              🌃  synthwave
            </button>
          </li>
          <li>
            <button data-set-theme="retro" data-act-class="active" className="">
              👴  retro
            </button>
          </li>
          <li>
            <button
              data-set-theme="cyberpunk"
              data-act-class="active"
              className=""
            >
              🤖  cyberpunk
            </button>
          </li>
          <li>
            <button
              data-set-theme="valentine"
              data-act-class="active"
              className=""
            >
              🌸  valentine
            </button>
          </li>
          <li>
            <button data-set-theme="halloween" data-act-class="active">
              🎃  halloween
            </button>
          </li>
          <li>
            <button data-set-theme="garden" data-act-class="active">
              🌷  garden
            </button>
          </li>
          <li>
            <button data-set-theme="forest" data-act-class="active">
              🌲  forest
            </button>
          </li>
          <li>
            <button data-set-theme="aqua" data-act-class="active">
              🐟  aqua
            </button>
          </li>
          <li>
            <button data-set-theme="lofi" data-act-class="active">
              👓  lofi
            </button>
          </li>
          <li>
            <button data-set-theme="pastel" data-act-class="active">
              🖍  pastel
            </button>
          </li>
          <li>
            <button data-set-theme="fantasy" data-act-class="active">
              🧚‍♀️  fantasy
            </button>
          </li>
          <li>
            <button data-set-theme="wireframe" data-act-class="active">
              📝  Wireframe
            </button>
          </li>
          <li>
            <button data-set-theme="black" data-act-class="active">
              🏴  black
            </button>
          </li>
          <li>
            <button data-set-theme="luxury" data-act-class="active">
              💎  luxury
            </button>
          </li>
          <li>
            <button data-set-theme="dracula" data-act-class="active">
              🧛‍♂️  dracula
            </button>
          </li>
          <li>
            <button data-set-theme="cmyk" data-act-class="active">
              🖨  CMYK
            </button>
          </li>
          <li>
            <button data-set-theme="autumn" data-act-class="active">
              🍁  Autumn
            </button>
          </li>
          <li>
            <button data-set-theme="business" data-act-class="active">
              💼  Business
            </button>
          </li>
          <li>
            <button data-set-theme="acid" data-act-class="active">
              💊  Acid
            </button>
          </li>
          <li>
            <button data-set-theme="lemonade" data-act-class="active">
              🍋  Lemonade
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default ThemeChanger;
