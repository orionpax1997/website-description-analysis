import { AnalysisFactory } from './analysis';
const test = async () => {
  const analysisData = await (await AnalysisFactory.create('http://t.mb5u.com/html/')).analysis();
  console.log(analysisData);
};
test();
export { AnalysisData } from './analysis';
export default AnalysisFactory;
