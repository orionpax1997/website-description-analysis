import request from 'request';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import iconv from 'iconv-lite';
import { getBrowser } from './browser';

/**
 * 解析工厂类
 * @author OrionPax
 */
export class AnalysisFactory {
  /**
   * 解析实例创建方法
   * @param url 要解析的网页地址
   * @returns 返回负责解析的实例
   * @author OrionPax
   */
  static async create(url: string): Promise<Analysis> {
    if (url.indexOf('juejin') !== -1) return await new JueJinAnalysisImpl(url).init();
    if (url.indexOf('segmentfault') !== -1) return await new SegmentfaultAnalysisImpl(url).init();
    return await new AnalysisImpl(url).init();
  }
}

/**
 * 解析类
 * @author OrionPax
 */
export abstract class Analysis {
  /** 目标 URL */
  protected readonly _url: string;
  /** 目标 HTML */
  protected _html!: string;
  /** CheerioAPI 对象 */
  protected $!: CheerioAPI;

  constructor(url: string) {
    this._url = url;
  }

  /**
   * 初始化方法
   * @returns 返回解析类本身
   * @author OrionPax
   */
  async init(): Promise<Analysis> {
    this._html = await curl(this._url);
    if (/<meta.*(gbk)+.*>/gi.test(this._html) && this._html.indexOf('�') !== -1) {
      this._html = await curl(this._url, 'gbk');
    }
    this.$ = cheerio.load(this._html);
    return this;
  }

  /**
   * 解析方法
   * @returns 返回解析数据
   * @see AnalysisData
   * @author OrionPax
   */
  async analysis(): Promise<AnalysisData> {
    return {
      url: this.url,
      title: this.title,
      description: this.description,
      image: this.image,
      favicon: await getBase64(this.favicon),
    };
  }

  /**
   * get URL
   * @author OrionPax
   */
  get url(): string {
    return this._url;
  }

  /**
   * 解析 Title
   * @author OrionPax
   */
  get title(): string {
    let article;
    if (this.$('article').length > 0) {
      article = this.$('article').first();
    } else if (this.$('div[class*=content]').length > 0) {
      article = this.$('div[class*=content]').first();
    } else if (this.$('div[class*=Content]').length > 0) {
      article = this.$('div[class*=content]').first();
    }
    if (this.$('meta[property=og:title]').length === 1) {
      return this.$('meta[property=og:title]').attr('content') as string;
    }
    if (article && article.find('h1').length === 1) {
      return article.find('h1').text().trim();
    }
    if (this.$('h1[class*=title]').length === 1) return this.$('h1[class*=title]').text().trim();
    if (this.$('h1[class*=Title]').length === 1) return this.$('h1[class*=Title]').text().trim();
    if (this.$('.title').length === 1) return this.$('.title').text().trim();
    if (this.$('h1>a').length === 1) return this.$('h1>a').text().trim();
    if (this.$('header h1').length === 1) return this.$('header h1').text().trim();
    if (this.$('h1').length === 1) return this.$('h1').text().trim();
    return this.$('title').text().trim();
  }

  /**
   * 解析 Description
   * @author OrionPax
   */
  get description(): string | undefined {
    let article;
    if (this.$('article').length > 0) {
      article = this.$('article').first();
    } else if (this.$('div[class*=content]').length > 0) {
      article = this.$('div[class*=content]').first();
    } else if (this.$('div[class*=Content]').length > 0) {
      article = this.$('div[class*=content]').first();
    }
    if (this.$('meta[property=og:description]').length === 1)
      return this.$('meta[property=og:description]').attr('content');
    else if (this.$('meta[name=description]').length === 1) {
      return this.$('meta[name=description]').attr('content');
    } else if (article && article.find('p').length > 0) {
      const p = article
        .find('p')
        .toArray()
        .find(p => {
          this.$(p).text().trim().length > 120;
        });
      if (p) {
        return this.$(p).text().trim().substring(0, 240);
      }
    }
    if (this.$('body p').length > 0) {
      const p = this.$('body p')
        .toArray()
        .find(p => this.$(p).text().trim().length > 120);
      if (p) {
        return this.$(p).text().trim().substring(0, 240);
      }
    }
    return this.$('body').text().substring(0, 240);
  }

  /**
   * 解析分享图或文章首张图片
   * @author OrionPax
   */
  get image(): string | undefined {
    let img;
    let article;
    if (this.$('article').length > 0) {
      article = this.$('article').first();
    } else if (this.$('div[class*=content]').length > 0) {
      article = this.$('div[class*=content]').first();
    } else if (this.$('div[class*=Content]').length > 0) {
      article = this.$('div[class*=content]').first();
    }
    if (this.$('meta[name=og:image]').length === 1) {
      img = this.$('meta[name=og:image]').attr('content');
    } else if (this.$('meta[property=og:image]').length === 1) {
      img = this.$('meta[property=og:image]').attr('content');
    } else if (article && article.find('p img').length > 0) {
      img = article.find('p img').first().attr('src');
    } else if (article && article.find('img').length > 0) {
      img = article.find('img').first().attr('src');
    }

    if (!img && this.$('img').length > 0) {
      const item = this.$('img')
        .toArray()
        .find(item => this.$(item).parent()[0].tagName === 'p');
      if (item) {
        img = this.$(item).attr('src');
      }
    }
    if (!img && this.$('img').length > 0) {
      const item = this.$('img')
        .toArray()
        .find(
          item => this.$(item).attr('src')?.indexOf('banner') !== -1 || this.$(item).attr('src')?.indexOf('logo') !== -1
        );
      if (item) {
        img = this.$(item).attr('src');
      }
    }

    // 相对路径转绝对路径
    if (img && !img.startsWith('http')) {
      img = resolve(this._url, img);
    }
    return img;
  }

  /**
   * 解析 Favicon
   * @author OrionPax
   */
  get favicon(): string {
    return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${this._url}&size=16`;
  }
}

/**
 * 默认实现类
 */
class AnalysisImpl extends Analysis {}

/**
 * 掘金的实现类
 * @see https://juejin.cn/
 * @author OrionPax
 */
class JueJinAnalysisImpl extends Analysis {
  private readonly titleRegExp: RegExp = /(?<=headline":")[^"]*/;
  private readonly imageRegExp: RegExp = /(?<=src=\\")[^"]*/;

  /**
   * 获取 Title
   * @author OrionPax
   */
  get title(): string {
    const match = this.titleRegExp.exec(this._html);
    if (match) return match[0];
    return '';
  }

  /**
   * @author OrionPax
   * 获取分享图或文章首张图片
   */
  get image(): string | undefined {
    const match = this.imageRegExp.exec(this._html);
    if (match) return unescape(match[0].replace(/\\u/g, '%u')).replace('\\', '');
    return undefined;
  }
}

/**
 * Segmentfault 的实现类
 * @see https://segmentfault.com
 * @author OrionPax
 */
class SegmentfaultAnalysisImpl extends Analysis {
  /**
   * 初始化方法
   * @returns 返回解析类本身
   * @author OrionPax
   */
  async init(): Promise<Analysis> {
    this._html = await getHtml(this._url, '.container');
    this.$ = cheerio.load(this._html);
    return this;
  }

  get description(): string | undefined {
    return this.$('meta[name=description]').attr('content');
  }

  get image(): string | undefined {
    return undefined;
  }
}

/**
 * 解析数据对象
 * @see Analysis.analysis
 * @author OrionPax
 */
export type AnalysisData = {
  /** 网站 URL */
  readonly url: string;
  /** 网站标题 */
  readonly title: string;
  /** 网站描述信息 */
  readonly description: string | undefined;
  /** 网站分享图或正文第一张图片 */
  readonly image: string | undefined;
  /** 网站 Favicon */
  readonly favicon: string | undefined;
};

/**
 * 获取目标 URL 的 HTML 代码
 * @param url 目标 URL
 * @returns 目标 HTML
 * @author OrionPax
 */
async function curl(url: string, encoding?: string): Promise<string> {
  return new Promise((resolve, reject) =>
    request(
      {
        url,
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
          Connection: 'keep-alive',
        },
        encoding: encoding !== undefined ? null : 'utf-8',
      },
      async (error, res, body) => {
        if (error) {
          reject(error);
        }
        if (res.statusCode === 301) {
          resolve(await curl(res.headers.location as string, encoding));
        }
        if (res.statusCode !== 200) {
          reject(res.statusMessage);
        }
        if (encoding) {
          resolve(iconv.decode(body, encoding));
        } else {
          resolve(body);
        }
      }
    )
  );
}

async function getHtml(url: string, selector: string) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(selector, { visible: true });
  const pageContent = await page.content();
  await page.close();
  return pageContent;
}

/**
 * 相对路径转绝对路径
 * @author OrionPax
 */
function resolve(url: string, relative: string): string {
  return new URL(relative, url).toString();
}

/**
 * 解析图片为 base64
 * @param url 图片 URL
 * @returns Base64 编码的图片
 * @author OrionPax
 */
async function getBase64(url: string): Promise<string | undefined> {
  return new Promise(resolve =>
    request({ url, encoding: null }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        resolve(undefined);
      } else {
        resolve(`data:${response.headers['content-type']};base64,${Buffer.from(body).toString('base64')}`);
      }
    })
  );
}
