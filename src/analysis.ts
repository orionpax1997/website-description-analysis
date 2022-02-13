import http from 'http';
import https from 'https';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';

/**
 * 解析工厂类
 */
export class AnalysisFactory {
  static async create(url: string): Promise<Analysis> {
    if (url.indexOf('juejin') !== -1) return await new JueJinAnalysisImpl(url).init();
    return await new AnalysisImpl(url).init();
  }
}

/**
 * 解析类
 */
export abstract class Analysis {
  // 目标 URL
  private readonly _url: string;
  // 目标 HTML
  protected _html!: string;
  // CheerioAPI 对象
  private $!: CheerioAPI;

  constructor(url: string) {
    this._url = url;
  }

  /**
   * 初始化方法
   * @returns 返回解析类本身
   */
  async init(): Promise<Analysis> {
    this._html = await curl(this._url);
    this.$ = cheerio.load(this._html);
    return this;
  }

  /**
   * 解析方法
   * @returns 返回解析数据
   * @see AnalysisData
   */
  analysis(): AnalysisData {
    return {
      url: this.url,
      title: this.title,
      description: this.description,
      image: this.image,
      favicon: this.favicon,
    };
  }

  /**
   * 获取 URL
   */
  get url(): string {
    return this._url;
  }

  /**
   * 获取 Title
   */
  get title(): string {
    if (this.$('h1[class*=title]').length === 1) return this.$('h1[class*=title]').text().trim();
    if (this.$('h1[class*=Title]').length === 1) return this.$('h1[class*=Title]').text().trim();
    if (this.$('.title').length === 1) return this.$('.title').text().trim();
    if (this.$('h1>a').length === 1) return this.$('h1>a').text().trim();
    if (this.$('header h1').length === 1) return this.$('header h1').text().trim();
    if (this.$('h1').length === 1) return this.$('h1').text().trim();
    return this.$('title').text().trim();
  }

  /**
   * 获取 Description
   */
  get description(): string | undefined {
    if (this.$('meta[property=og:description]').length === 1)
      return this.$('meta[property=og:description]').attr('content');
    return this.$('meta[name=description]').attr('content');
  }

  /**
   * 获取分享图或文章首张图片
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

    // 相对路径转绝对路径
    if (img && !img.startsWith('http')) {
      img = resolve(this._url, img);
    }
    return img;
  }

  /**
   * 获取 Favicon
   */
  get favicon(): string {
    return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${this._url}&size=16`;
  }
}

class AnalysisImpl extends Analysis {}

class JueJinAnalysisImpl extends Analysis {
  private readonly titleRegExp: RegExp = /(?<=headline":")[^"]*/;

  get title(): string {
    const match = this.titleRegExp.exec(this._html);
    if (match) return match[0];
    return '';
  }
}

/**
 * 解析数据对象
 */
export type AnalysisData = {
  readonly url: string;
  readonly title: string;
  readonly description: string | undefined;
  readonly image: string | undefined;
  readonly favicon: string;
};

/**
 * 获取目标 URL 的 HTML 代码
 * @param url 目标 URL
 * @returns 目标 HTML
 */
async function curl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    (url.startsWith('https') ? https : http)
      .get(url, res => {
        let data = '';
        res.on('data', function (chunk) {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      })
      .on('error', error => {
        reject(error);
      });
  });
}

/**
 * 相对路径转绝对路径
 */
function resolve(url: string, relative: string): string {
  return new URL(relative, url).toString();
}
