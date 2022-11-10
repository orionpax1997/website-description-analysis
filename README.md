# Website Description Analysis

A small tool for parsing web page description information.

[![使用 Website Description Analysis 解析网页简介信息](https://website-card-embed.vercel.app/api/screenshot?url=https://humble-blog.vercel.app/website-description-analysis/)](https://humble-blog.vercel.app/website-description-analysis/)

## Installation

```bash
yarn add @humble.xiang/website-description-analysis
# or
npm i @humble.xiang/website-description-analysis
```

## Usage

```js
// CommonJS require
const AnalysisFactory = require('@humble.xiang/website-description-analysis');
// OR
// ES6 import
import AnalysisFactory from '@humble.xiang/website-description-analysis';
```

```js
(async () => {
  // Create an instance of the analysis factory
  const AnalysisImpl = await AnalysisFactory.create('https://gohugo.io/getting-started/');
  // Get the analysis result
  const analysisData = await AnalysisImpl.analysis();
  // Print the analysis result
  console.log(analysisData);
})();

/* analysisData = 
{
  // The url of the page
  url: 'https://gohugo.io/getting-started/',
  // The title of the page
  title: 'Get Started',
  // The description of the page
  description: 'Quick start and guides for installing Hugo on your preferred operating system.',
  // The first image of the page
  image: 'https://gohugo.io/opengraph/gohugoio-card-base-1_huf001e7df4fd9c00c4355abac7d4ca455_242906_filter_4404557853099614649.png',
  // The favicon of the page (base64 encoded)
  favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACVklEQVQ4jZWTz0tUURTHP+e9l/N75uk0icZoYrUREYKsRSDUIogioqK2USFF1DZbVLTIRZuICCKqVbsgKvoPIlIXQSZkUEHKiD9mfI7OmxnnvXtbvLHREKIDF8493+/5cr9fuMJfNcYNgJDAUeBWfXxbwzugupe7G/iy1owyhEKLhdELXDUM81TCTqUAlp2lJaX8l8ADDzVuILqf4UBghCHCWNTw24HzglyMRmPZbdl27K0tADjzBeamc7huaUqjnwBPt2DmKniYg+aApbU+DTwKhcJnW3d32NsP9xJPJhDXRwwh0p0m1ZfFqpBaXSkP+L53SIODKZPmpfDBTnz1rDmd7unc2S32/i7Me/vAWYWJxcDfmS7Myz3Ev5RJEhGvVmurVMp9Rsh6Y2BgiUiTnUkTjsXAAKIWWAJKB8cyIGKBQDgew86kEZEmDCxrQ5paN+K1m6AjHvTJJqCOad1IHrDYrJSGk11wJBsoRy1w/U2pmwsIMF6Az4Xg3p+Bzvj/CAiMzMOL74FYyIQdiX8JCBvMGQJmfSbrABHWEw0Unta65izkqbrlIKuqAl81lnwFqz5oqJZcnIU8WusaCs+8wIGSKAoVt7yruOhkKHkSmnQxvhah5AUvma3gvc+xMPqD6W8/9UpxeQIYVqgP8pHrtBInj9sBDApyLhaLt7Vm20mmmwEo5heZncpRKq3MaPRz4HEL0V9zrDTMjDGEAsNE9gDXTNM8nrTtBEDRcZZ9338N3FfoT4KotV+5PjbecoU2kmiICJwAbtahOxpeCZRnKHKMh392fgMmttjdxujptAAAAABJRU5ErkJggg=='
}
*/
```

## Documentation

[![使用 Website Description Analysis 解析网页简介信息](https://website-card-embed.humblex.top/api/screenshot?url=https://website-description-analysis-docs.humblex.top/)](https://website-description-analysis-docs.humblex.top/)
