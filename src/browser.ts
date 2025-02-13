import chromium from '@sparticuz/chromium';
import core, { Browser } from 'puppeteer-core';

const isDev = !process.env.AWS_REGION;
let _browser: Browser | null;

const exePath =
  process.platform === 'win32'
    ? 'C:\\Users\\Administrator\\scoop\\apps\\google-chrome\\current\\chrome.exe'
    : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

interface Options {
  args: string[];
  executablePath: string;
  headless: boolean;
}

async function getOptions() {
  let options: Options;
  if (isDev) {
    options = {
      executablePath: exePath,
      headless: false,
      args: [],
    };
  } else {
    options = {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    };
  }
  return options;
}

export async function getBrowser() {
  if (_browser) {
    return _browser;
  }
  const options = await getOptions();
  _browser = await core.launch(options);
  return _browser;
}
