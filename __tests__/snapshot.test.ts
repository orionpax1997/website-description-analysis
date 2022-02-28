import { AnalysisFactory } from '../src/analysis';

describe('get description function', () => {
  it('analysis https://zhuanlan.zhihu.com/p/59838643', async () => {
    const analysisData = await (await AnalysisFactory.create('https://zhuanlan.zhihu.com/p/59838643')).analysis();
    expect(analysisData).toMatchSnapshot({ image: expect.any(String) });
  });

  it('analysis https://www.cnblogs.com/yichong/p/9234265.html', async () => {
    const analysisData = await (
      await AnalysisFactory.create('https://www.cnblogs.com/yichong/p/9234265.html')
    ).analysis();
    expect(analysisData).toMatchSnapshot();
  });

  it('analysis https://blog.csdn.net/design_Lu/article/details/94870265', async () => {
    const analysisData = await (
      await AnalysisFactory.create('https://blog.csdn.net/design_Lu/article/details/94870265')
    ).analysis();
    expect(analysisData).toMatchSnapshot();
  });

  it('analysis https://segmentfault.com/a/1190000020387433', async () => {
    const analysisData = await (await AnalysisFactory.create('https://segmentfault.com/a/1190000020387433')).analysis();
    expect(analysisData).toMatchSnapshot({ image: expect.any(String) });
  });

  it('analysis https://www.jianshu.com/p/eec5e34ff0c2', async () => {
    const analysisData = await (await AnalysisFactory.create('https://www.jianshu.com/p/eec5e34ff0c2')).analysis();
    expect(analysisData).toMatchSnapshot();
  });

  it('analysis https://blog.51cto.com/u_15349616/3717558', async () => {
    const analysisData = await (await AnalysisFactory.create('https://blog.51cto.com/u_15349616/3717558')).analysis();
    expect(analysisData).toMatchSnapshot();
  });

  it('analysis https://juejin.cn/post/6844904009887645709', async () => {
    const analysisData = await (await AnalysisFactory.create('https://juejin.cn/post/6844904009887645709')).analysis();
    expect(analysisData).toMatchSnapshot();
  });

  it('analysis http://t.mb5u.com/html/', async () => {
    const analysisData = await (await AnalysisFactory.create('http://t.mb5u.com/html/')).analysis();
    expect(analysisData).toMatchSnapshot();
  });
});
